'use client'

import { motion } from 'framer-motion'
import { Zap, FileText, Presentation, Clock, Upload } from 'lucide-react'
import Link from 'next/link'

const actions = [
  {
    name: 'Submit Assignment',
    description: 'Earn credits & rewards',
    href: '/submissions',
    icon: Upload,
    color: 'from-purple-500 to-violet-500',
  },
  {
    name: 'Start Research',
    description: 'Get AI-powered answers',
    href: '/research',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Create Slides',
    description: 'Generate presentation',
    href: '/powerpoint',
    icon: Presentation,
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Recent Work',
    description: 'Continue where you left',
    href: '/history',
    icon: Clock,
    color: 'from-indigo-500 to-purple-500',
  },
]

export function QuickActions() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-400" />
        <h2 className="text-xl font-bold text-white">Quick Actions</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <Link key={action.name} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className={`relative bg-gradient-to-br ${action.color} p-6 rounded-2xl cursor-pointer overflow-hidden group`}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
                
                <div className="relative">
                  <Icon className="w-8 h-8 text-white mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {action.name}
                  </h3>
                  <p className="text-sm text-white/80">
                    {action.description}
                  </p>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

