'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useCredits() {
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refresh = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setCredits(0)
        return
      }

      // Get user profile with credits
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('credits, subscription_tier')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        // If user has subscription, set to unlimited (999)
        if (profile.subscription_tier === 'premium' || profile.subscription_tier === 'pro') {
          setCredits(999)
        } else {
          setCredits(profile.credits || 0)
        }
      } else {
        setCredits(0)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { credits, loading, refresh }
}

