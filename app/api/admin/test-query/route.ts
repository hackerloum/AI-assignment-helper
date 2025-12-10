import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Debug endpoint to test admin query
 * Call this after logging in to see what's happening
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
        authenticated: false
      });
    }

    const adminClient = createAdminClient();

    // Test 1: Get user by email from auth
    const { data: authUsers } = await adminClient.auth.admin.listUsers();
    const authUser = authUsers?.users.find(u => u.email === user.email);

    // Test 2: Get all roles
    const { data: allRoles } = await adminClient
      .from('user_roles')
      .select('*');

    // Test 3: Get roles for this specific user_id
    const { data: rolesByUserId } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);

    // Test 4: Get admin role specifically
    const { data: adminRole } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    // Test 5: Try with different role values (case sensitivity test)
    const { data: adminRoleLower } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .ilike('role', 'admin');

    return NextResponse.json({
      authenticated: true,
      currentUser: {
        id: user.id,
        email: user.email,
        idLength: user.id.length,
        idType: typeof user.id,
      },
      authUser: authUser ? {
        id: authUser.id,
        email: authUser.email,
        idMatches: authUser.id === user.id,
      } : null,
      queries: {
        allRoles: allRoles || [],
        rolesByUserId: rolesByUserId || [],
        adminRole: adminRole || [],
        adminRoleLowercase: adminRoleLower || [],
      },
      analysis: {
        totalRolesInDb: allRoles?.length || 0,
        rolesForThisUser: rolesByUserId?.length || 0,
        adminRolesFound: adminRole?.length || 0,
        adminRolesFoundLowercase: adminRoleLower?.length || 0,
        hasAdminRole: (adminRole && adminRole.length > 0) || false,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

