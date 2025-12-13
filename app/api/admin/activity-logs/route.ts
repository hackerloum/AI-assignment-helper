import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    // Get cookies as fallback
    const cookieStore = await cookies();
    
    // Create Supabase client
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
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const adminClient = createAdminClient();
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roleData && roleData.some(r => r.role === 'admin');
    
    if (!hasAdminRole) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get activity logs
    const { data: logs, error } = await adminClient
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    // Get admin emails
    const adminIds = [...new Set(logs?.map(l => l.admin_id).filter(Boolean) || [])];
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    
    const userEmailMap = new Map(
      authUsers?.users.map(u => [u.id, u.email]) || []
    );

    // Enrich logs with admin emails
    const enrichedLogs = (logs || []).map(log => ({
      ...log,
      admin_email: userEmailMap.get(log.admin_id) || 'Unknown',
    }));

    return NextResponse.json({
      success: true,
      logs: enrichedLogs,
    });
  } catch (error: any) {
    console.error('[Admin Activity Logs] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

