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
