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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/cp/login?error=unauthorized')
  }

  // Check admin role server-side using admin client
  try {
    const adminClient = createAdminClient()
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id)
      .eq('role', 'admin')

    const hasAdminRole = roleData && roleData.length > 0 && roleData[0].role === 'admin'

    if (roleError || !hasAdminRole) {
      console.log('[Admin Redirect] Access denied for:', user.email)
      redirect('/cp/login?error=unauthorized')
    }

    console.log('[Admin Redirect] Access granted for:', user.email)
    revalidatePath('/cp', 'layout')
    redirect('/cp')
  } catch (error: any) {
    console.error('[Admin Redirect] Error:', error)
    redirect('/cp/login?error=unauthorized')
  }
}

