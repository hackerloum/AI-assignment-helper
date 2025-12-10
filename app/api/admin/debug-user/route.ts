import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Debug endpoint to check user admin status
 * Call this from browser console: fetch('/api/admin/debug-user').then(r => r.json()).then(console.log)
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

    // Get all roles for this user
    const { data: allRoles, error: rolesError } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);

    // Check specifically for admin
    const { data: adminRole, error: adminError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      roles: {
        all: allRoles || [],
        admin: adminRole || null,
        hasAdmin: !!adminRole && adminRole.role === 'admin',
      },
      errors: {
        rolesError: rolesError?.message,
        adminError: adminError?.message,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

