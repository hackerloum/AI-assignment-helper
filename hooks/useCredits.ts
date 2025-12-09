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
        setLoading(false)
        return
      }

      // Get user credits from the correct table
      const { data: creditRecord, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If record doesn't exist, create it with default 50 credits for new users
        if (error.code === 'PGRST116') {
          // No rows returned - create new record
          const { data: newRecord, error: insertError } = await supabase
            .from('user_credits')
            .insert({ user_id: user.id, balance: 50 })
            .select('balance')
            .single()

          if (insertError) {
            console.error('Error creating credit record:', insertError)
            setCredits(50) // Default credits even if insert fails
          } else {
            setCredits(newRecord?.balance || 50)
          }
        } else {
          console.error('Error fetching credits:', error)
          setCredits(0)
        }
      } else if (creditRecord) {
        setCredits(creditRecord.balance || 0)
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

