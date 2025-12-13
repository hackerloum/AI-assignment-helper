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
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken || undefined);
    
    console.log('[Admin Users API] User check:', { 
      hasUser: !!user, 
      userId: user?.id,
      error: userError?.message 
    });
    
    if (userError || !user) {
      console.error('[Admin Users API] No authenticated user:', userError);
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

    console.log('[Admin Users API] Role check:', { 
      roleData, 
      error: roleError?.message 
    });

    const hasAdminRole = roleData && roleData.length > 0 && roleData.some(r => r.role === 'admin');
    
    if (!hasAdminRole) {
      console.error('[Admin Users API] User does not have admin role:', { userId: user.id, roles: roleData });
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get all users from auth
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    // Get user roles
    const { data: userRoles } = await adminClient
      .from('user_roles')
      .select('user_id, role');

    // Get user credits
    const { data: userCredits } = await adminClient
      .from('user_credits')
      .select('user_id, balance, has_paid_one_time_fee');

    // Combine data
    const users = (authUsers?.users || []).map((user) => {
      const role = userRoles?.find((r) => r.user_id === user.id)?.role || 'user';
      const credits = userCredits?.find((c) => c.user_id === user.id);

      return {
        id: user.id,
        email: user.email || '',
        role,
        balance: credits?.balance || 0,
        has_paid_one_time_fee: credits?.has_paid_one_time_fee || false,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error('[Admin Users] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
