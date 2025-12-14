import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header (more reliable than cookies)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    // Get cookies as fallback
    const cookieStore = await cookies();
    
    // Create Supabase client directly in API route
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Cookie setting might fail in API routes, that's okay
            }
          },
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    );
    
    // Get authenticated user (will use the access token if provided)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken || undefined);

    if (authError || !user) {
      console.error('[Submit API] Auth error:', authError?.message, '| Has token:', !!accessToken);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      submissionType,
      groupId,
      title,
      subject,
      collegeName,
      academicLevel,
      wordCount,
      formattingStyle,
      coverPageData,
      assignmentContent,
      fileUrls = [],
      references = [],
      canUseForTraining = false,
    } = body;

    // Validate required fields
    if (!title || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: title and subject are required" },
        { status: 400 }
      );
    }

    if (!collegeName) {
      return NextResponse.json(
        { error: "College/University name is required" },
        { status: 400 }
      );
    }

    // Validate: either file upload OR text content required
    const hasFile = Array.isArray(fileUrls) && fileUrls.length > 0 && fileUrls[0];
    const hasContent = assignmentContent && assignmentContent.trim().length > 0;

    if (!hasFile && !hasContent) {
      return NextResponse.json(
        { error: "Please either upload a file or provide assignment content" },
        { status: 400 }
      );
    }

    // Validate word count for text submissions
    if (hasContent && (!wordCount || wordCount < 100)) {
      return NextResponse.json(
        { error: "Word count must be at least 100 words when providing text content" },
        { status: 400 }
      );
    }

    // If group submission, verify membership
    // Use admin client to bypass RLS and avoid recursion issues
    if (submissionType === 'group' && groupId) {
      // First check if user created the group (this doesn't query assignment_group_members)
      const { data: groupCheck } = await supabase
        .from('assignment_groups')
        .select('id, created_by')
        .eq('id', groupId)
        .single();

      // If user didn't create the group, check membership using admin client to avoid RLS recursion
      if (!groupCheck || groupCheck.created_by !== user.id) {
        const adminClient = createAdminClient();
        const { data: memberCheck, error: memberError } = await adminClient
          .from('assignment_group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError || !memberCheck) {
          console.error('[Submit API] Group membership check failed:', memberError);
          return NextResponse.json(
            { error: "Not a member of this group" },
            { status: 403 }
          );
        }
      }
    }

    // Create submission using admin client to bypass RLS and avoid recursion
    // This is safe because we've already validated the user and their permissions
    const adminClient = createAdminClient();
    const { data: submission, error } = await adminClient
      .from('assignment_submissions')
      .insert({
        user_id: user.id,
        submission_type: submissionType || 'individual',
        group_id: submissionType === 'group' ? groupId : null,
        title: title.trim(),
        subject: subject.trim(),
        college_name: collegeName.trim(),
        academic_level: academicLevel || 'undergraduate',
        word_count: parseInt(wordCount) || 0,
        formatting_style: formattingStyle || 'APA',
        cover_page_data: coverPageData || {},
        assignment_content: hasContent ? assignmentContent.trim() : null,
        file_urls: Array.isArray(fileUrls) && fileUrls.length > 0 ? fileUrls : [],
        references: Array.isArray(references) ? references : [],
        status: 'pending',
        can_use_for_training: canUseForTraining,
      })
      .select()
      .single();

    if (error) {
      console.error('[Submit API] Submission error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error: error
      });
      
      // Provide helpful error messages for common issues
      let errorMessage = error.message;
      if (error.message.includes('null value') && error.message.includes('assignment_content')) {
        errorMessage = "Database migration required: Please run migration 018_make_assignment_content_nullable.sql to allow file-only submissions.";
      } else if (error.message.includes('violates not-null constraint')) {
        errorMessage = `Database constraint error: ${error.message}. Please check that all required fields are provided.`;
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create submission", 
          details: errorMessage,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        message: "Submission received! It will be reviewed within 24-48 hours.",
      },
    });
  } catch (error: any) {
    console.error('[Submit API] Unexpected error:', {
      message: error.message,
      stack: error.stack,
      error: error
    });
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

