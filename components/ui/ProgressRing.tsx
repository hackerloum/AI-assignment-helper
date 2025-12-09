'use client'

import { motion } from 'framer-motion'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: 'emerald' | 'amber' | 'red' | 'blue' | 'purple'
}

const colorMap = {
  emerald: {
    bg: 'stroke-emerald-500/20',
    progress: 'stroke-emerald-500',
  },
  amber: {
    bg: 'stroke-amber-500/20',
    progress: 'stroke-amber-500',
  },
  red: {
    bg: 'stroke-red-500/20',
    progress: 'stroke-red-500',
  },
  blue: {
    bg: 'stroke-blue-500/20',
    progress: 'stroke-blue-500',
  },
  purple: {
    bg: 'stroke-purple-500/20',
    progress: 'stroke-purple-500',
  },
}

export function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 10,
  color = 'emerald'
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const colors = colorMap[color]

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={colors.bg}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors.progress}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
    </div>
  )
}

