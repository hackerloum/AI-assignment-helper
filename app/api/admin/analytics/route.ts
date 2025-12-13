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
    
    // Create Supabase client with both token and cookies support
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Cookie setting in API routes
          },
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken || undefined);
    
    console.log('[Admin Analytics API] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      error: authError?.message 
    });
    
    if (authError || !user) {
      console.error('[Admin Analytics API] No authenticated user:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check admin role
    const adminClient = createAdminClient();
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    console.log('[Admin Analytics API] Role check:', { 
      roleData, 
      error: roleError?.message 
    });

    const hasAdminRole = roleData && roleData.length > 0 && roleData.some(r => r.role === 'admin');
    
    if (!hasAdminRole) {
      console.error('[Admin Analytics API] User does not have admin role:', { userId: user.id, roles: roleData });
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get total users from auth.users
    const { data: authUsers, error: listUsersError } = await adminClient.auth.admin.listUsers();
    const totalUsers = authUsers?.users.length || 0;

    // Get total payments and revenue
    const { data: payments } = await adminClient
      .from('payments')
      .select('amount, payment_status');

    const totalPayments = payments?.length || 0;
    const totalRevenue = payments
      ?.filter((p) => p.payment_status === 'completed' || p.payment_status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    // Get submissions stats
    const { data: submissions } = await adminClient
      .from('assignment_submissions')
      .select('status');

    const pendingSubmissions = submissions?.filter((s) => s.status === 'pending').length || 0;
    const approvedSubmissions = submissions?.filter((s) => s.status === 'approved').length || 0;

    // Get active users - count users who have user_credits (paid users)
    const { count: activeUsers } = await adminClient
      .from('user_credits')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        totalPayments,
        totalRevenue,
        pendingSubmissions,
        approvedSubmissions,
        activeUsers: activeUsers || 0,
      },
    });
  } catch (error: any) {
    console.error('[Admin Analytics] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
