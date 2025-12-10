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
        .eq('role', 'admin')
        .single();

      if (!currentUserRole) {
        return NextResponse.json({ hasAccess: false, error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Check if the userId has admin role using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    const hasAccess = !error && data && data.role === 'admin';

    return NextResponse.json({ hasAccess });
  } catch (error: any) {
    console.error('[Admin Check Access] Error:', error);
    return NextResponse.json(
      { hasAccess: false, error: error.message },
      { status: 500 }
    );
  }
}

