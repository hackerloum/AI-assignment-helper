import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/auth';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // Get total users
    const { count: totalUsers } = await adminClient
      .from('user_credits')
      .select('*', { count: 'exact', head: true });

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

    // Get active users (users with recent activity - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
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

