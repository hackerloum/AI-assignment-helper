'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function handleLoginRedirect() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      revalidatePath('/', 'layout')
      redirect('/dashboard')
    }
  } catch (error) {
    // If redirect fails, return error (will be caught by client)
    throw error
  }
}

