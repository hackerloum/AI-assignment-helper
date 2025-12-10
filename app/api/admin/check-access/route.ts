import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    console.log('='.repeat(80));
    console.log('[CHECK ACCESS] START');
    console.log('[CHECK ACCESS] User ID:', userId);
    
    if (!userId) {
      console.log('[CHECK ACCESS] ERROR: No userId provided');
      console.log('='.repeat(80));
      return NextResponse.json({ hasAccess: false, error: 'userId is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    
    // Simple query - get all rows from user_roles for this user_id
    const { data: roles, error } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', userId);

    console.log('[CHECK ACCESS] Query error:', error?.message || 'none');
    console.log('[CHECK ACCESS] Roles found:', JSON.stringify(roles, null, 2));
    
    // Check if any role is admin
    let hasAccess = false;
    if (roles && Array.isArray(roles) && roles.length > 0) {
      hasAccess = roles.some(r => r.role === 'admin');
      console.log('[CHECK ACCESS] Checking roles...');
      roles.forEach(r => {
        console.log(`  - Role: "${r.role}", Is admin? ${r.role === 'admin'}`);
      });
    } else {
      console.log('[CHECK ACCESS] No roles found for this user_id');
    }
    
    console.log('[CHECK ACCESS] FINAL RESULT: hasAccess =', hasAccess);
    console.log('='.repeat(80));

    return NextResponse.json({ hasAccess });
  } catch (error: any) {
    console.error('[CHECK ACCESS] EXCEPTION:', error.message);
    console.error('[CHECK ACCESS] Stack:', error.stack);
    console.log('='.repeat(80));
    return NextResponse.json(
      { hasAccess: false, error: error.message },
      { status: 500 }
    );
  }
}
