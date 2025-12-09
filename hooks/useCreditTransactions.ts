'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'earned' | 'spent' | 'purchased'
  description: string
  created_at: string
}

export function useCreditTransactions(limit?: number) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setTransactions([])
          setLoading(false)
          return
        }

        let query = supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching credit transactions:', error)
          setTransactions([])
        } else {
          setTransactions(data || [])
        }
      } catch (error) {
        console.error('Error fetching credit transactions:', error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [supabase, limit])

  return { transactions, loading }
}

