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

    const { data: templates, error } = await adminClient
      .from('assignment_templates')
      .select('*')
      .order('college_name');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      templates: templates || [],
    });
  } catch (error: any) {
    console.error('[Admin Templates] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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

    const { id, ...updates } = body;

    const { data, error } = await adminClient
      .from('assignment_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      template: data,
    });
  } catch (error: any) {
    console.error('[Admin Templates] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

