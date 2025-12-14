import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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
      console.error('[Stats API] Auth error:', authError?.message, '| Has token:', !!accessToken);
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

