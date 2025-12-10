import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/auth';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ hasAccess: false }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    // Verify the userId matches the authenticated user or check admin status
    if (userId && userId !== user.id) {
      // If checking for another user, must be admin
      const adminStatus = await isAdmin();
      if (!adminStatus) {
        return NextResponse.json({ hasAccess: false }, { status: 403 });
      }
    }

    // Check if user is admin
    const hasAccess = await isAdmin();

    return NextResponse.json({ hasAccess });
  } catch (error: any) {
    console.error('[Admin Check Access] Error:', error);
    return NextResponse.json(
      { hasAccess: false, error: error.message },
      { status: 500 }
    );
  }
}

