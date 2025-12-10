import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const collegeName = searchParams.get('collegeName');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('assignment_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (collegeName) {
      query = query.ilike('college_name', `%${collegeName}%`);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Get total count
    let countQuery = supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (collegeName) {
      countQuery = countQuery.ilike('college_name', `%${collegeName}%`);
    }

    const { count } = await countQuery;

    // Get unique college names for filtering
    const { data: collegeData } = await supabase
      .from('assignment_submissions')
      .select('college_name')
      .eq('user_id', user.id)
      .not('college_name', 'is', null);

    const uniqueColleges = Array.from(
      new Set(
        (collegeData || [])
          .map(item => item.college_name)
          .filter(Boolean)
      )
    ).sort();

    return NextResponse.json({
      success: true,
      submissions: submissions || [],
      total: count || 0,
      limit,
      offset,
      colleges: uniqueColleges,
    });
  } catch (error: any) {
    console.error('List submissions error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

