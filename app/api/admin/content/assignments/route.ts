import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken || undefined);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roleData && roleData.some(r => r.role === 'admin');
    
    if (!hasAdminRole) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { data: assignments, error } = await adminClient
      .from('assignments_new')
      .select('id, user_id, title, assignment_type, created_at, word_count')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    // Get user emails
    const userIds = [...new Set(assignments?.map(a => a.user_id).filter(Boolean) || [])];
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    
    const userEmailMap = new Map(
      authUsers?.users.map(u => [u.id, u.email]) || []
    );

    // Enrich assignments with user emails
    const enrichedAssignments = (assignments || []).map(assignment => ({
      ...assignment,
      user_email: userEmailMap.get(assignment.user_id) || 'Unknown',
    }));

    return NextResponse.json({
      success: true,
      assignments: enrichedAssignments,
    });
  } catch (error: any) {
    console.error('[Admin Content] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    const cookieStore = await cookies();
    const body = await request.json();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    );
    
    const { data: { user } } = await supabase.auth.getUser(accessToken || undefined);
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roleData && roleData.some(r => r.role === 'admin');
    
    if (!hasAdminRole) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = body;

    const { error } = await adminClient
      .from('assignments_new')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('[Admin Content] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

