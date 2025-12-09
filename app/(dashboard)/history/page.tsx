'use client'

import { motion } from 'framer-motion'
import { History, FileText, RefreshCw, Shield, FileCode, Presentation } from 'lucide-react'
import { useAssignments } from '@/hooks/useAssignments'
import { format } from 'date-fns'

const toolIcons: Record<string, { icon: typeof FileText; color: string; bgColor: string; name: string }> = {
  essay: { icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-500/10', name: 'Essay Writer' },
  paraphrase: { icon: RefreshCw, color: 'text-purple-400', bgColor: 'bg-purple-500/10', name: 'Paraphrase Tool' },
  grammar: { icon: RefreshCw, color: 'text-purple-400', bgColor: 'bg-purple-500/10', name: 'Grammar Check' },
  citation: { icon: FileCode, color: 'text-amber-400', bgColor: 'bg-amber-500/10', name: 'Citation Generator' },
  summarizer: { icon: Presentation, color: 'text-pink-400', bgColor: 'bg-pink-500/10', name: 'Text Summarizer' },
}

export default function HistoryPage() {
  const { assignments, loading } = useAssignments()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-slate-500/10 rounded-xl">
            <History className="w-6 h-6 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Usage History</h1>
        </div>
        <p className="text-slate-400">
          View your AI tool usage and download previous results
        </p>
      </motion.div>

      {/* History List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
              <div className="h-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-12 text-center"
        >
          <History className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No usage history yet</h3>
          <p className="text-slate-400">Start using AI tools to see your history here</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {assignments.map((assignment, index) => {
            const toolInfo = toolIcons[assignment.tool_type] || { icon: FileText, color: 'text-slate-400', bgColor: 'bg-slate-500/10', name: 'Tool' }
            const Icon = toolInfo.icon
            const date = new Date(assignment.created_at)
            const formattedDate = format(date, 'MMM dd, yyyy')
            const formattedTime = format(date, 'HH:mm')
            const preview = assignment.input_text.substring(0, 100) + (assignment.input_text.length > 100 ? '...' : '')

            return (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`${toolInfo.bgColor} p-3 rounded-xl flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${toolInfo.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{toolInfo.name}</h3>
                    <p className="text-sm text-slate-400 truncate">{preview}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-slate-500">Credits: {assignment.credits_used}</span>
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-slate-400">{formattedDate}</p>
                    <p className="text-xs text-slate-500">{formattedTime}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}

