'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface UsageStats {
  toolsUsedToday: number
  totalCreditsUsed: number
  totalAssignments: number
  weeklyUsage: { day: string; value: number }[]
}

export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats>({
    toolsUsedToday: 0,
    totalCreditsUsed: 0,
    totalAssignments: 0,
    weeklyUsage: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }

        // Get today's date range
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Get assignments used today
        const { data: todayAssignments } = await supabase
          .from('assignments')
          .select('credits_used')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString())

        // Get total stats
        const { data: allAssignments } = await supabase
          .from('assignments')
          .select('credits_used, created_at')
          .eq('user_id', user.id)

        // Calculate weekly usage (last 7 days)
        const weeklyData: { day: string; value: number }[] = []
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          date.setHours(0, 0, 0, 0)
          const nextDate = new Date(date)
          nextDate.setDate(nextDate.getDate() + 1)

          const dayAssignments = allAssignments?.filter(a => {
            const created = new Date(a.created_at)
            return created >= date && created < nextDate
          }) || []

          weeklyData.push({
            day: dayNames[date.getDay()],
            value: dayAssignments.length,
          })
        }

        const totalCreditsUsed = allAssignments?.reduce((sum, a) => sum + (a.credits_used || 0), 0) || 0

        setStats({
          toolsUsedToday: todayAssignments?.length || 0,
          totalCreditsUsed,
          totalAssignments: allAssignments?.length || 0,
          weeklyUsage: weeklyData,
        })
      } catch (error) {
        console.error('Error fetching usage stats:', error)
        // Set default weekly data on error to ensure graph still renders
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const defaultWeeklyData = dayNames.map(day => ({ day, value: 0 }))
        setStats(prev => ({
          ...prev,
          weeklyUsage: defaultWeeklyData,
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return { stats, loading }
}

