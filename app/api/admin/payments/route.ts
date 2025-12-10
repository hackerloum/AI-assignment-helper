import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/auth';

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

    // Get all payments
    const { data: payments, error } = await adminClient
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      throw error;
    }

    // Get user emails for payments
    const userIds = [...new Set(payments?.map((p) => p.user_id).filter(Boolean) || [])];
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    
    const userEmailMap = new Map(
      authUsers?.users.map((u) => [u.id, u.email]) || []
    );

    // Enrich payments with user emails
    const enrichedPayments = (payments || []).map((payment) => ({
      id: payment.id,
      user_id: payment.user_id,
      user_email: userEmailMap.get(payment.user_id) || 'Unknown',
      amount: payment.amount || 0,
      payment_status: payment.payment_status,
      payment_method: payment.payment_method,
      order_id: payment.order_id || payment.id,
      created_at: payment.created_at,
    }));

    return NextResponse.json({
      success: true,
      payments: enrichedPayments,
    });
  } catch (error: any) {
    console.error('[Admin Payments] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

