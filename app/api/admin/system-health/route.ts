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

    // Measure database response time
    const dbStartTime = Date.now();
    await adminClient.from('user_roles').select('count').limit(1);
    const dbResponseTime = Date.now() - dbStartTime;

    // Get storage stats (estimate)
    const { data: users } = await adminClient.auth.admin.listUsers();
    const { count: submissionsCount } = await adminClient
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true });
    const { count: paymentsCount } = await adminClient
      .from('payments')
      .select('*', { count: 'exact', head: true });

    // Estimate storage (rough calculation)
    const estimatedStorageGB = Math.round(
      ((users?.users.length || 0) * 0.001) +
      ((submissionsCount || 0) * 0.01) +
      ((paymentsCount || 0) * 0.0001)
    );

    const health = {
      database: {
        status: dbResponseTime < 100 ? 'healthy' : dbResponseTime < 300 ? 'warning' : 'error',
        responseTime: dbResponseTime,
        connections: 10, // Mock value
      },
      api: {
        status: 'healthy',
        averageResponseTime: Math.round(dbResponseTime * 1.2),
        requestsPerMinute: 120, // Mock value
      },
      storage: {
        used: estimatedStorageGB,
        total: 100,
        percentage: Math.round((estimatedStorageGB / 100) * 100),
      },
      uptime: '99.9%',
    };

    return NextResponse.json({
      success: true,
      health,
    });
  } catch (error: any) {
    console.error('[Admin System Health] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

