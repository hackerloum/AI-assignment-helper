'use client'

import { motion } from 'framer-motion'
import { Receipt, CreditCard, ArrowUpCircle, ArrowDownCircle, ArrowRight } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { useCreditTransactions } from '@/hooks/useCreditTransactions'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function PaymentHistoryWidget() {
  const { payments, loading: paymentsLoading } = usePayments(3)
  const { transactions, loading: transactionsLoading } = useCreditTransactions(3)

  const loading = paymentsLoading || transactionsLoading

  // Combine recent payments and transactions
  const recentItems = [
    ...payments.map(p => ({
      id: p.id,
      type: 'payment' as const,
      date: p.created_at,
      title: `Payment - ${p.credits_purchased} credits`,
      amount: p.amount,
      status: p.payment_status,
      credits: p.credits_purchased,
    })),
    ...transactions.slice(0, 3 - payments.length).map(t => ({
      id: t.id,
      type: 'transaction' as const,
      date: t.created_at,
      title: t.description,
      amount: t.amount,
      status: 'completed' as const,
      credits: Math.abs(t.amount),
      transactionType: t.type,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-40 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (recentItems.length === 0) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Payment History</h3>
          <Receipt className="w-5 h-5 text-slate-500" />
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No payment history</p>
          <p className="text-slate-500 text-xs mt-2">Make a purchase to see your history here</p>
        </div>
        <Link href="/payment-history">
          <button className="w-full mt-4 py-2 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">
            View payment history
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Payment History</h3>
        <Receipt className="w-5 h-5 text-amber-400" />
      </div>
      
      <div className="space-y-4">
        {recentItems.map((item, index) => {
          let icon, iconColor, iconBg

          if (item.type === 'payment') {
            icon = CreditCard
            iconColor = 'text-blue-400'
            iconBg = 'bg-blue-500/10'
          } else if (item.transactionType === 'earned' || item.transactionType === 'purchased') {
            icon = ArrowUpCircle
            iconColor = 'text-emerald-400'
            iconBg = 'bg-emerald-500/10'
          } else {
            icon = ArrowDownCircle
            iconColor = 'text-red-400'
            iconBg = 'bg-red-500/10'
          }

          const Icon = icon
          const timeAgo = formatDistanceToNow(new Date(item.date), { addSuffix: true })

          return (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className={`${iconBg} p-2 rounded-lg flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {item.type === 'payment' && (
                    <p className="text-xs text-slate-400">
                      TZS {item.amount.toLocaleString()}
                    </p>
                  )}
                  <p className={`text-xs font-semibold ${
                    item.type === 'transaction' && item.transactionType === 'spent'
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }`}>
                    {item.type === 'transaction' && item.transactionType === 'spent' ? '-' : '+'}
                    {item.credits} credits
                  </p>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {timeAgo}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <Link href="/payment-history">
        <button className="w-full mt-4 py-2 text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors flex items-center justify-center gap-2">
          View all payments
          <ArrowRight className="w-4 h-4" />
        </button>
      </Link>
    </div>
  )
}

