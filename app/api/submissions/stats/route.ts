import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
        console.error('[Stats API] Auth error:', authError.message);
      }
    }
    
    if (sessionError) {
      console.error('[Stats API] Session error:', sessionError.message);
    }

    if (!user) {
      console.error('[Stats API] No user found. Session:', !!session, 'Session error:', sessionError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's submission stats
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('id, status, credits_awarded, created_at, quality_score')
      .eq('user_id', user.id);

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submission stats" },
        { status: 500 }
      );
    }

    // Get user's leaderboard entry
    const { data: leaderboardEntry } = await supabase
      .from('user_leaderboard')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get recent submissions (last 3)
    const recentSubmissions = (submissions || [])
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    // Calculate stats
    const totalSubmissions = submissions?.length || 0;
    const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0;
    const pendingSubmissions = submissions?.filter(s => s.status === 'pending' || s.status === 'under_review').length || 0;
    const totalCreditsEarned = submissions?.reduce((sum, s) => sum + (s.credits_awarded || 0), 0) || 0;
    const averageQuality = submissions && submissions.length > 0
      ? submissions.reduce((sum, s) => sum + (s.quality_score || 0), 0) / submissions.filter(s => s.quality_score).length
      : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalSubmissions,
        approvedSubmissions,
        pendingSubmissions,
        totalCreditsEarned,
        averageQuality: averageQuality || 0,
        rank: leaderboardEntry?.rank_position || null,
        recentSubmissions,
      },
    });
  } catch (error: any) {
    console.error('Submission stats error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

