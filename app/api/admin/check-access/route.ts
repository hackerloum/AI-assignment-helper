import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ hasAccess: false, error: 'userId is required' }, { status: 400 });
    }

    // Try to get authenticated user from session (may not be available immediately after login)
    const supabase = await createClient();
    const { data: { user: sessionUser } } = await supabase.auth.getUser();

    // If we have a session user, verify userId matches (security check)
    if (sessionUser && userId !== sessionUser.id) {
      // Only allow checking other users if current user is admin
      const adminClient = createAdminClient();
      const { data: currentUserRole } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionUser.id)
        .eq('role', 'admin');

      // Use array check instead of single()
      if (!currentUserRole || currentUserRole.length === 0) {
        return NextResponse.json({ hasAccess: false, error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Check if the userId has admin role using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    
    console.log('[Admin Check Access] Checking user_id:', userId);
    console.log('[Admin Check Access] User ID type:', typeof userId);
    
    // First, get all roles for this user
    const { data: allRoles, error: allError } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    console.log('[Admin Check Access] All roles for user:', JSON.stringify(allRoles, null, 2));
    
    // Now query specifically for admin
    const { data, error } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', userId)
      .eq('role', 'admin');

    console.log('[Admin Check Access] Admin query result:', JSON.stringify(data, null, 2));
    console.log('[Admin Check Access] Admin query error:', error?.message);
    
    // Check if we found any admin roles (array result)
    const hasAccess = !error && data && Array.isArray(data) && data.length > 0 && data[0].role === 'admin';
    
    console.log('[Admin Check Access] Has access:', hasAccess);
    console.log('[Admin Check Access] Data is array?', Array.isArray(data));
    console.log('[Admin Check Access] Data length:', data?.length);

    return NextResponse.json({ hasAccess });
  } catch (error: any) {
    console.error('[Admin Check Access] Error:', error);
    return NextResponse.json(
      { hasAccess: false, error: error.message },
      { status: 500 }
    );
  }
}

