'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function handleLoginRedirect() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'page')
    // redirect() throws and doesn't return - this is expected
    redirect('/dashboard')
  }
  // If no user, redirect() won't be called and function returns undefined
  // Client will handle fallback
}

