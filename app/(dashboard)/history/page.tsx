'use client'

import { motion } from 'framer-motion'
import { History, FileText, RefreshCw, Shield } from 'lucide-react'

const historyItems = [
  {
    tool: 'Research Assistant',
    action: 'Generated research on Climate Change',
    date: '2024-12-09',
    time: '14:30',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    tool: 'Grammar & Rewrite',
    action: 'Improved 2,345 words',
    date: '2024-12-09',
    time: '12:15',
    icon: RefreshCw,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    tool: 'Plagiarism Checker',
    action: 'Scanned document (98% original)',
    date: '2024-12-08',
    time: '16:45',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
]

export default function HistoryPage() {
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        {historyItems.map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 hover:border-amber-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`${item.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.tool}</h3>
                  <p className="text-sm text-slate-400">{item.action}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-slate-400">{item.date}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

