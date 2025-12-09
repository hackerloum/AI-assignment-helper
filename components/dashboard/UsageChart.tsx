'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { useUsageStats } from '@/hooks/useUsageStats'

export function UsageChart() {
  const { stats, loading } = useUsageStats()

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-6" />
        <div className="flex items-end justify-between gap-2 h-32">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 bg-white/5 rounded-t" style={{ height: `${Math.random() * 100}%` }} />
          ))}
        </div>
      </div>
    )
  }

  // Ensure we have data, default to 7 days with 0 values if empty
  const data = stats.weeklyUsage && stats.weeklyUsage.length > 0 
    ? stats.weeklyUsage 
    : [
        { day: 'Sun', value: 0 },
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
      ]

  // Calculate max value, ensuring at least 1 to avoid division by zero
  const values = data.map(d => d.value || 0)
  const maxValue = Math.max(...values, 1)

  // Calculate trend (compare this week to last week)
  const thisWeekTotal = data.reduce((sum, d) => sum + (d.value || 0), 0)
  const lastWeekTotal = 0 // We don't have historical data, so this is a placeholder
  const trend = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(0) : '0'

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Weekly Usage</h3>
        {trend !== '0' && (
          <div className="flex items-center gap-1 text-emerald-400 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{trend.startsWith('-') ? trend : `+${trend}`}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {data && data.length > 0 ? (
          data.map((item, index) => {
            const height = maxValue > 0 ? ((item.value || 0) / maxValue) * 100 : 0
            return (
              <div key={`${item.day}-${index}`} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg relative group cursor-pointer"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ minHeight: height > 0 ? '4px' : '0' }}
                >
                  {/* Tooltip */}
                  {(item.value || 0) > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dashboard-bg border border-dashboard-border rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {item.value} uses
                    </div>
                  )}
                </motion.div>
                
                <span className="text-xs text-slate-500">{item.day}</span>
              </div>
            )
          })
        ) : (
          <div className="w-full text-center text-slate-500 text-sm py-8">
            No usage data available
          </div>
        )}
      </div>
    </div>
  )
}

