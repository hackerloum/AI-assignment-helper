'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionHref 
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-12 text-center"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-6 max-w-md">{description}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref}>
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {actionLabel}
            </motion.button>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

