'use client'

import { motion } from 'framer-motion'
import { User, Users } from 'lucide-react'

interface AssignmentTypeSelectorProps {
  value: 'individual' | 'group' | null
  onChange: (type: 'individual' | 'group') => void
}

export function AssignmentTypeSelector({ value, onChange }: AssignmentTypeSelectorProps) {
  const types = [
    {
      id: 'individual' as const,
      title: 'Individual Assignment',
      description: 'Single student submission with your personal details',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'group' as const,
      title: 'Group Assignment',
      description: 'Multiple students with group representatives and members',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-3">Select Assignment Type</h2>
      <p className="text-slate-400 mb-8">
        Choose whether this is an individual or group assignment
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {types.map((type) => {
          const Icon = type.icon
          const isSelected = value === type.id
          return (
            <motion.button
              key={type.id}
              onClick={() => onChange(type.id)}
              className={`relative bg-gradient-to-br ${type.color} p-8 rounded-2xl text-left transition-all ${
                isSelected ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-dashboard-bg' : ''
              }`}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{type.title}</h3>
              <p className="text-sm text-white/80">{type.description}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

