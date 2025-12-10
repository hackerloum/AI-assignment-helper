import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      submissionType,
      groupId,
      title,
      subject,
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
    if (!title || !subject || !assignmentContent) {
      return NextResponse.json(
        { error: "Missing required fields: title, subject, and assignmentContent are required" },
        { status: 400 }
      );
    }

    // Validate word count
    if (!wordCount || wordCount < 100) {
      return NextResponse.json(
        { error: "Word count must be at least 100 words" },
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
        academic_level: academicLevel || 'undergraduate',
        word_count: parseInt(wordCount) || 0,
        formatting_style: formattingStyle || 'APA',
        cover_page_data: coverPageData || {},
        assignment_content: assignmentContent.trim(),
        file_urls: Array.isArray(fileUrls) ? fileUrls : [],
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

