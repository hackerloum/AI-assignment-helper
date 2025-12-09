'use client'

import { motion } from 'framer-motion'
import { FileText, RefreshCw, Shield, Clock, FileCode, Presentation } from 'lucide-react'
import { useAssignments } from '@/hooks/useAssignments'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

const toolIcons: Record<string, { icon: typeof FileText; color: string; bgColor: string; name: string }> = {
  essay: { icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-500/10', name: 'Essay Writer' },
  paraphrase: { icon: RefreshCw, color: 'text-purple-400', bgColor: 'bg-purple-500/10', name: 'Paraphrase Tool' },
  grammar: { icon: RefreshCw, color: 'text-purple-400', bgColor: 'bg-purple-500/10', name: 'Grammar Check' },
  citation: { icon: FileCode, color: 'text-amber-400', bgColor: 'bg-amber-500/10', name: 'Citation Generator' },
  summarizer: { icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-500/10', name: 'Text Summarizer' },
}

export function RecentActivity() {
  const { assignments, loading } = useAssignments(3)

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Clock className="w-5 h-5 text-slate-500" />
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No recent activity</p>
          <p className="text-slate-500 text-xs mt-2">Start using AI tools to see your activity here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        <Clock className="w-5 h-5 text-slate-500" />
      </div>
      
      <div className="space-y-4">
        {assignments.map((assignment, index) => {
          const toolInfo = toolIcons[assignment.tool_type] || { icon: FileText, color: 'text-slate-400', bgColor: 'bg-slate-500/10', name: 'Tool' }
          const Icon = toolInfo.icon
          const timeAgo = formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })
          const preview = assignment.input_text.substring(0, 50) + (assignment.input_text.length > 50 ? '...' : '')

          return (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`${toolInfo.bgColor} p-2 rounded-lg flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${toolInfo.color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {toolInfo.name}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {preview}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {timeAgo}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <Link href="/history">
        <button className="w-full mt-4 py-2 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">
          View all activity
        </button>
      </Link>
    </div>
  )
}

