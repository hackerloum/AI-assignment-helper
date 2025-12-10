'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Zap,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface SubmissionStats {
  totalSubmissions: number
  approvedSubmissions: number
  pendingSubmissions: number
  totalCreditsEarned: number
  averageQuality: number
  rank: number | null
  recentSubmissions: Array<{
    id: string
    status: string
    credits_awarded: number
    created_at: string
    quality_score: number | null
  }>
}

export function SubmissionStats() {
  const [stats, setStats] = useState<SubmissionStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/submissions/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching submission stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-32 mb-4" />
        <div className="h-8 bg-white/5 rounded w-24 mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/5 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const hasSubmissions = stats.totalSubmissions > 0
  const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
    under_review: { icon: Clock, color: 'text-blue-400', label: 'Reviewing' },
    approved: { icon: CheckCircle2, color: 'text-green-400', label: 'Approved' },
    rejected: { icon: Award, color: 'text-red-400', label: 'Rejected' },
    needs_revision: { icon: Clock, color: 'text-orange-400', label: 'Revision' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 relative overflow-hidden group"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-300">
                Earn Credits & Rewards
              </h3>
              <p className="text-xs text-slate-500">
                Submit assignments to earn credits
              </p>
            </div>
          </div>
          {stats.rank && (
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-purple-400">#{stats.rank}</span>
            </div>
          )}
        </div>

        {!hasSubmissions ? (
          // Empty state - encourage first submission
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-white font-semibold mb-2">
              Start Earning Credits!
            </h4>
            <p className="text-sm text-slate-400 mb-4">
              Submit your completed assignments and get rewarded with credits
            </p>
            <Link href="/submissions">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all"
              >
                <Upload className="w-4 h-4" />
                Submit Assignment
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-slate-400">Approved</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.approvedSubmissions}</p>
                <p className="text-xs text-slate-500 mt-1">of {stats.totalSubmissions} total</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-400">Credits Earned</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalCreditsEarned}</p>
                <p className="text-xs text-slate-500 mt-1">from submissions</p>
              </div>
            </div>

            {/* Recent Submissions */}
            {stats.recentSubmissions.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-300">Recent Submissions</h4>
                  <Link 
                    href="/submissions"
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    View all
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {stats.recentSubmissions.map((submission) => {
                    const StatusIcon = statusConfig[submission.status]?.icon || Clock
                    const statusColor = statusConfig[submission.status]?.color || 'text-slate-400'
                    return (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <StatusIcon className={`w-4 h-4 ${statusColor} flex-shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-300 truncate">
                              {format(new Date(submission.created_at), 'MMM d, yyyy')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {submission.credits_awarded > 0 && (
                                <span className="text-xs font-semibold text-green-400">
                                  +{submission.credits_awarded} credits
                                </span>
                              )}
                              {submission.quality_score && (
                                <span className="text-xs text-slate-500">
                                  • {submission.quality_score.toFixed(1)}/5.0
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Call to Action */}
            <Link href="/submissions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 text-purple-400 text-sm font-semibold rounded-lg hover:from-purple-500/30 hover:to-purple-600/30 transition-all"
              >
                <Upload className="w-4 h-4" />
                Submit New Assignment
                <TrendingUp className="w-4 h-4" />
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </motion.div>
  )
}

