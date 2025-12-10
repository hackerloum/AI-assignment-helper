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

    console.log('[Check Access] ============ START ============');
    console.log('[Check Access] Checking user_id:', userId);

    // Check if the userId has admin role using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    
    // Get ALL roles for this user - simpler query
    const { data: allRoles, error: queryError } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    console.log('[Check Access] Query error:', queryError);
    console.log('[Check Access] All roles found:', JSON.stringify(allRoles, null, 2));
    
    // Check if any role is 'admin'
    const hasAdminRole = allRoles && allRoles.some(r => r.role === 'admin');
    
    console.log('[Check Access] Has admin role?', hasAdminRole);
    console.log('[Check Access] ============ END ============');

    return NextResponse.json({ hasAccess: hasAdminRole });
  } catch (error: any) {
    console.error('[Check Access] Error:', error);
    return NextResponse.json(
      { hasAccess: false, error: error.message },
      { status: 500 }
    );
  }
}
