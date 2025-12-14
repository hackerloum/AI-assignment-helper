import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Try getSession first (more reliable for API routes)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    let user = session?.user ?? null;
    
    // Fallback to getUser if session didn't work
    if (!user) {
      const { data: { user: userFromGetUser }, error: authError } = await supabase.auth.getUser();
      user = userFromGetUser ?? null;
      
      if (authError) {
        console.error('[Submit API] Auth error:', authError.message);
      }
    }
    
    if (sessionError) {
      console.error('[Submit API] Session error:', sessionError.message);
    }

    if (!user) {
      console.error('[Submit API] No user found. Session:', !!session, 'Session error:', sessionError?.message);
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
    if (submissionType === 'group' && groupId) {
      const { data: memberCheck, error: memberError } = await supabase
        .from('assignment_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (memberError || !memberCheck) {
        return NextResponse.json(
          { error: "Not a member of this group" },
          { status: 403 }
        );
      }
    }

    // Create submission
    const { data: submission, error } = await supabase
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
        assignment_content: hasContent ? assignmentContent.trim() : '',
        file_urls: Array.isArray(fileUrls) && fileUrls.length > 0 ? fileUrls : [],
        references: Array.isArray(references) ? references : [],
        status: 'pending',
        can_use_for_training: canUseForTraining,
      })
      .select()
      .single();

    if (error) {
      console.error('Submission error:', error);
      return NextResponse.json(
        { error: "Failed to create submission", details: error.message },
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
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

