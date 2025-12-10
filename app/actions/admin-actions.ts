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
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id)

    const hasAdminRole = roleData && roleData.some(r => r.role === 'admin')

    if (!hasAdminRole) {
      redirect('/cp/login?error=unauthorized')
    }

    revalidatePath('/cp', 'layout')
    revalidatePath('/cp', 'page')
    redirect('/cp')
  } catch (error: any) {
    redirect('/cp/login?error=unauthorized')
  }
}

