'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function handleLoginRedirect() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Check if user has paid the one-time fee
    const { data: userCredits } = await supabase
      .from('user_credits')
      .select('has_paid_one_time_fee')
      .eq('user_id', user.id)
      .single()

    const hasPaid = userCredits?.has_paid_one_time_fee || false

    revalidatePath('/', 'layout')
    revalidatePath('/dashboard', 'page')
    
    // Redirect to payment page if not paid, otherwise to dashboard
    if (!hasPaid) {
      redirect('/one-time-payment')
    } else {
      redirect('/dashboard')
    }
  }
  // If no user, redirect() won't be called and function returns undefined
  // Client will handle fallback
}

