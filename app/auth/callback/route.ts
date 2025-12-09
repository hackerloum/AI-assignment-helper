import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Check if user has paid the one-time fee
      const { data: userCredits } = await supabase
        .from('user_credits')
        .select('has_paid_one_time_fee')
        .eq('user_id', user.id)
        .single()

      const hasPaid = userCredits?.has_paid_one_time_fee || false

      // Redirect to payment page if not paid, otherwise to dashboard
      if (!hasPaid) {
        return NextResponse.redirect(`${origin}/one-time-payment`)
      } else {
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  // Return to login with error if something went wrong
  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}

