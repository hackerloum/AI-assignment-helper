import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin - get user from request
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
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
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get total users from auth.users
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
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
