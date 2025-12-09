'use client'

import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const data = [
  { day: 'Mon', value: 12 },
  { day: 'Tue', value: 19 },
  { day: 'Wed', value: 15 },
  { day: 'Thu', value: 25 },
  { day: 'Fri', value: 22 },
  { day: 'Sat', value: 18 },
  { day: 'Sun', value: 8 },
]

const maxValue = Math.max(...data.map(d => d.value))

export function UsageChart() {
  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Weekly Usage</h3>
        <div className="flex items-center gap-1 text-emerald-400 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>+23%</span>
        </div>
      </div>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100
          return (
            <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className="w-full bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg relative group cursor-pointer"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dashboard-bg border border-dashboard-border rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.value} uses
                </div>
              </motion.div>
              
              <span className="text-xs text-slate-500">{item.day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

