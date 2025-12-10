import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Debug endpoint to verify user_id matching
 * Helps identify if there's a mismatch between auth.users.id and user_roles.user_id
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        error: 'Not authenticated'
      });
    }

    const adminClient = createAdminClient();

    // Get user from auth
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const authUser = authUsers?.users.find(u => u.email === user.email);

    // Get roles for this user by email (to find any potential mismatches)
    const { data: allUserRoles } = await adminClient
      .from('user_roles')
      .select('*');

    // Find roles for this specific user_id
    const { data: rolesByUserId } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);

    // Find roles by email (if we can match)
    const rolesByEmail = allUserRoles?.filter(role => {
      const roleUser = authUsers?.users.find(u => u.id === role.user_id);
      return roleUser?.email === user.email;
    });

    return NextResponse.json({
      authenticated: true,
      currentUser: {
        id: user.id,
        email: user.email,
      },
      authUser: authUser ? {
        id: authUser.id,
        email: authUser.email,
      } : null,
      rolesByUserId: rolesByUserId || [],
      rolesByEmail: rolesByEmail || [],
      allRoles: allUserRoles || [],
      match: {
        userIdMatches: rolesByUserId && rolesByUserId.length > 0,
        emailMatches: rolesByEmail && rolesByEmail.length > 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

