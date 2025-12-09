'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Infinity, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCredits } from '@/hooks/useCredits'

export function CreditCounter() {
  const { credits, loading, refresh } = useCredits()
  const [timeUntilReset, setTimeUntilReset] = useState('')

  useEffect(() => {
    refresh()
    
    // Update countdown every minute
    const updateCountdown = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setHours(24, 0, 0, 0)
      
      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeUntilReset(`${hours}h ${minutes}m`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000)

    return () => clearInterval(interval)
  }, [refresh])

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-24 mb-4" />
        <div className="h-8 bg-white/5 rounded w-16 mb-2" />
        <div className="h-2 bg-white/5 rounded w-full" />
      </div>
    )
  }

  const isUnlimited = credits >= 999
  const percentage = isUnlimited ? 100 : (credits / 3) * 100

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 relative overflow-hidden group">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              {isUnlimited ? (
                <Infinity className="w-5 h-5 text-amber-400" />
              ) : (
                <Zap className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <h3 className="text-sm font-semibold text-slate-300">
              {isUnlimited ? 'Unlimited Access' : 'Daily Credits'}
            </h3>
          </div>
          
          {!isUnlimited && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeUntilReset}</span>
            </div>
          )}
        </div>

        {/* Credits Display */}
        {isUnlimited ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-2">
              <Infinity className="w-8 h-8 text-amber-400" />
              <span className="text-sm text-slate-400">Unlimited uses</span>
            </div>
            <p className="text-xs text-slate-500">
              Your subscription is active
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-white">{credits}</span>
              <span className="text-lg text-slate-500">/ 3</span>
            </div>
            <p className="text-xs text-slate-500">
              {credits > 0 ? 'Credits remaining today' : 'No credits remaining'}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-4">
          <motion.div
            className={`h-full ${
              isUnlimited 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                : credits === 0 
                ? 'bg-red-500' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          
          {/* Shimmer effect */}
          {!isUnlimited && credits > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>

        {/* CTA */}
        {!isUnlimited && (
          <Link href="/subscription">
            <motion.button
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {credits === 0 ? 'Get More Credits' : 'Upgrade to Unlimited'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        )}
      </div>
    </div>
  )
}

