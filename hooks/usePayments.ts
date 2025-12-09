'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Payment {
  id: string
  amount: number
  credits_purchased: number
  payment_method: string
  payment_status: 'pending' | 'completed' | 'failed'
  transaction_id: string | null
  phone_number: string
  created_at: string
  updated_at: string
}

export function usePayments(limit?: number) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setPayments([])
          setLoading(false)
          return
        }

        let query = supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching payments:', error)
          setPayments([])
        } else {
          setPayments(data || [])
        }
      } catch (error) {
        console.error('Error fetching payments:', error)
        setPayments([])
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [supabase, limit])

  return { payments, loading }
}

