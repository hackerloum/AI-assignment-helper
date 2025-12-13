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

    // For now, return empty array as announcements table might not exist yet
    // In production, fetch from announcements table
    return NextResponse.json({
      success: true,
      announcements: [],
    });
  } catch (error: any) {
    console.error('[Admin Announcements] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Create notification for all target users
    const { data: allUsers } = await adminClient.auth.admin.listUsers();
    
    let targetUserIds: string[] = [];
    if (body.target_audience === 'all') {
      targetUserIds = allUsers?.users.map(u => u.id) || [];
    } else if (body.target_audience === 'students') {
      const { data: roles } = await adminClient.from('user_roles').select('user_id, role');
      const adminIds = new Set(roles?.filter(r => r.role === 'admin' || r.role === 'moderator').map(r => r.user_id) || []);
      targetUserIds = allUsers?.users.filter(u => !adminIds.has(u.id)).map(u => u.id) || [];
    } else {
      const { data: roles } = await adminClient.from('user_roles').select('user_id').eq('role', 'admin');
      targetUserIds = roles?.map(r => r.user_id) || [];
    }

    // Create notifications for each target user using the notification system
    const notificationsCreated = [];
    for (const userId of targetUserIds) {
      const { data: notification, error: notifError } = await adminClient
        .rpc('create_intelligent_notification', {
          p_user_id: userId,
          p_type: 'system_announcement',
          p_title: body.title,
          p_message: body.message,
          p_priority: body.priority,
          p_action_url: null,
          p_action_label: null,
          p_metadata: { created_by: user.id, target_audience: body.target_audience },
          p_should_show_immediately: body.priority === 'urgent' || body.priority === 'high',
        });

      if (!notifError && notification) {
        notificationsCreated.push(notification);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Announcement sent to ${notificationsCreated.length} users`,
      notificationsCreated: notificationsCreated.length,
    });
  } catch (error: any) {
    console.error('[Admin Announcements] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

