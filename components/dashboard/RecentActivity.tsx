'use client'

import { motion } from 'framer-motion'
import { FileText, RefreshCw, Shield, Clock } from 'lucide-react'

const activities = [
  {
    tool: 'Research Assistant',
    action: 'Generated research paper',
    time: '5 minutes ago',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    tool: 'Grammar Check',
    action: 'Improved 2,345 words',
    time: '1 hour ago',
    icon: RefreshCw,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    tool: 'Plagiarism Check',
    action: 'Scanned document (98% original)',
    time: '3 hours ago',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
]

export function RecentActivity() {
  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <Clock className="w-5 h-5 text-slate-500" />
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`${activity.bgColor} p-2 rounded-lg flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {activity.tool}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <button className="w-full mt-4 py-2 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">
        View all activity
      </button>
    </div>
  )
}

