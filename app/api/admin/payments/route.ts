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
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

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
