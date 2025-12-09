'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Assignment {
  id: string
  tool_type: 'essay' | 'paraphrase' | 'grammar' | 'citation' | 'summarizer'
  input_text: string
  output_text: string
  credits_used: number
  created_at: string
}

export function useAssignments(limit?: number) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setAssignments([])
          setLoading(false)
          return
        }

        let query = supabase
          .from('assignments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching assignments:', error)
          setAssignments([])
        } else {
          setAssignments(data || [])
        }
      } catch (error) {
        console.error('Error fetching assignments:', error)
        setAssignments([])
      } finally {
        setLoading(false)
      }
    }

    fetchAssignments()
  }, [supabase, limit])

  return { assignments, loading }
}

