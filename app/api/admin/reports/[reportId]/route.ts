import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    const cookieStore = await cookies();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const { reportId } = await params;
    
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

    let csv = '';

    switch (reportId) {
      case 'users': {
        const { data: users } = await adminClient.auth.admin.listUsers();
        const { data: roles } = await adminClient.from('user_roles').select('*');
        const { data: credits } = await adminClient.from('user_credits').select('*');
        
        const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
        const creditMap = new Map(credits?.map(c => [c.user_id, c.balance]) || []);
        
        csv = 'Email,Role,Credits,Created At\n';
        users?.users.forEach(u => {
          csv += `"${u.email}","${roleMap.get(u.id) || 'user'}","${creditMap.get(u.id) || 0}","${u.created_at}"\n`;
        });
        break;
      }
      case 'payments': {
        let query = adminClient.from('payments').select('*');
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        const { data: payments } = await query.order('created_at', { ascending: false });
        
        csv = 'Order ID,User ID,Amount,Status,Method,Created At\n';
        payments?.forEach(p => {
          csv += `"${p.order_id || p.id}","${p.user_id}","${p.amount}","${p.payment_status}","${p.payment_method || 'N/A'}","${p.created_at}"\n`;
        });
        break;
      }
      case 'submissions': {
        let query = adminClient.from('assignment_submissions').select('*');
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        const { data: submissions } = await query.order('created_at', { ascending: false });
        
        csv = 'ID,User ID,Status,Quality Score,Credits Awarded,Created At\n';
        submissions?.forEach(s => {
          csv += `"${s.id}","${s.user_id}","${s.status}","${s.quality_score || 'N/A'}","${s.credits_awarded || 0}","${s.created_at}"\n`;
        });
        break;
      }
      case 'revenue': {
        let query = adminClient.from('payments').select('*').eq('payment_status', 'completed');
        if (startDate) query = query.gte('created_at', startDate);
        if (endDate) query = query.lte('created_at', endDate);
        const { data: payments } = await query.order('created_at', { ascending: false });
        
        csv = 'Date,Amount,Count,Total Revenue\n';
        const byDate = new Map<string, { amount: number; count: number }>();
        payments?.forEach(p => {
          const date = p.created_at.split('T')[0];
          const existing = byDate.get(date) || { amount: 0, count: 0 };
          byDate.set(date, {
            amount: existing.amount + (p.amount || 0),
            count: existing.count + 1,
          });
        });
        
        Array.from(byDate.entries()).sort().forEach(([date, data]) => {
          csv += `"${date}","${data.amount}","${data.count}","${data.amount}"\n`;
        });
        break;
      }
      case 'activity': {
        const { data: logs } = await adminClient
          .from('admin_activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000);
        
        const json = JSON.stringify(logs || [], null, 2);
        return new NextResponse(json, {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="activity_log_${new Date().toISOString().split('T')[0]}.json"`,
          },
        });
      }
      default:
        return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${reportId}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('[Admin Reports] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

