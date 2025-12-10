'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Server action to handle admin login redirect
 * Verifies admin role server-side before redirecting
 */
export async function handleAdminLoginRedirect() {
  console.log('[Admin Redirect Action] Starting...');
  
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  console.log('[Admin Redirect Action] User:', user?.email || 'none');
  console.log('[Admin Redirect Action] User error:', userError?.message || 'none');
  
  if (!user) {
    console.log('[Admin Redirect Action] No user, redirecting to login');
    redirect('/cp/login?error=unauthorized')
  }

  // Check admin role server-side using admin client
  try {
    const adminClient = createAdminClient()
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id)

    console.log('[Admin Redirect Action] Roles found:', JSON.stringify(roleData, null, 2));
    
    const hasAdminRole = roleData && roleData.some(r => r.role === 'admin')

    if (!hasAdminRole) {
      console.log('[Admin Redirect Action] ❌ Access denied for:', user.email)
      redirect('/cp/login?error=unauthorized')
    }

    console.log('[Admin Redirect Action] ✅ Access granted, redirecting to /cp')
    revalidatePath('/cp', 'layout')
    revalidatePath('/cp', 'page')
    redirect('/cp')
  } catch (error: any) {
    console.error('[Admin Redirect Action] ❌ Error:', error.message)
    redirect('/cp/login?error=unauthorized')
  }
}

