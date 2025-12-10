import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ hasAccess: false, error: 'userId is required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    
    // Get all roles for this user_id
    const { data: roles, error } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', userId);

    // Check if any role is admin
    const hasAccess = roles && Array.isArray(roles) && roles.length > 0 && roles.some(r => r.role === 'admin');

    return NextResponse.json({ hasAccess });
  } catch (error: any) {
    return NextResponse.json(
      { hasAccess: false, error: error.message },
      { status: 500 }
    );
  }
}
