import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  calculateSubmissionCredits,
  awardSubmissionCredits,
  checkAndAwardAchievements,
} from "@/lib/submission-credits";
import { isModeratorOrAdmin } from "@/lib/admin/auth";

async function getGroupMemberCount(
  groupId: string | null,
  supabase: any
): Promise<number> {
  if (!groupId) return 1;
  
  const { count, error } = await supabase
    .from('assignment_group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId);
  
  return count || 1;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or moderator
    const hasAccess = await isModeratorOrAdmin();
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      submissionId,
      status, // 'approved', 'rejected', 'needs_revision'
      qualityScore,
      contentQuality,
      formattingCompliance,
      originality,
      academicRigor,
      feedback,
    } = body;

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: submissionId and status" },
        { status: 400 }
      );
    }

    // Get submission details
    const { data: submission, error: fetchError } = await supabase
      .from('assignment_submissions')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Calculate overall quality score if not provided
    let overallScore = qualityScore;
    if (!overallScore && contentQuality && formattingCompliance && originality && academicRigor) {
      overallScore = (contentQuality + formattingCompliance + originality + academicRigor) / 4;
    } else if (!overallScore) {
      overallScore = 3.0; // Default score
    }

    // Create review record
    const { error: reviewError } = await supabase.from('submission_reviews').insert({
      submission_id: submissionId,
      reviewer_id: user.id,
      content_quality: contentQuality || overallScore,
      formatting_compliance: formattingCompliance || overallScore,
      originality: originality || overallScore,
      academic_rigor: academicRigor || overallScore,
      overall_score: overallScore,
      feedback: feedback || '',
      recommendation: status,
    });

    if (reviewError) {
      console.error('Review creation error:', reviewError);
    }

    // Update submission
    const updateData: any = {
      status,
      quality_score: overallScore,
      reviewer_id: user.id,
      reviewer_feedback: feedback || '',
      reviewed_at: new Date().toISOString(),
    };

    // If approved, calculate and award credits
    if (status === 'approved') {
      const memberCount = submission.submission_type === 'group' 
        ? await getGroupMemberCount(submission.group_id, supabase)
        : 1;

      const credits = await calculateSubmissionCredits(
        submissionId,
        overallScore,
        submission.word_count,
        submission.submission_type,
        submission.can_use_for_training,
        memberCount,
        supabase
      );

      // Award credits to submitter
      await awardSubmissionCredits(
        submission.user_id,
        submissionId,
        credits,
        submission.title,
        supabase
      );

      // If group submission, award credits to all members
      if (submission.submission_type === 'group' && submission.group_id) {
        const { data: members } = await supabase
          .from('assignment_group_members')
          .select('user_id')
          .eq('group_id', submission.group_id);

        if (members && members.length > 0) {
          const creditsPerMember = Math.floor(credits / (members.length + 1));
          for (const member of members) {
            if (member.user_id !== submission.user_id) {
              await awardSubmissionCredits(
                member.user_id,
                submissionId,
                creditsPerMember,
                `Group assignment: ${submission.title}`,
                supabase
              );
            }
          }
        }
      }

      // Check for achievements
      await checkAndAwardAchievements(submission.user_id, submissionId, supabase);

      updateData.credits_awarded = credits;
      updateData.credits_awarded_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('assignment_submissions')
      .update(updateData)
      .eq('id', submissionId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: "Failed to update submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: status === 'approved' 
        ? `Submission approved! ${updateData.credits_awarded || 0} credits awarded.`
        : `Submission ${status}.`,
      creditsAwarded: status === 'approved' ? updateData.credits_awarded : 0,
    });
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

