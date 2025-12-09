'use client'

import { motion } from 'framer-motion'
import { 
  CreditCard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { useCreditTransactions } from '@/hooks/useCreditTransactions'
import { useAssignments } from '@/hooks/useAssignments'
import { format } from 'date-fns'
import { useState } from 'react'

type TabType = 'all' | 'payments' | 'transactions' | 'usage'

export default function PaymentHistoryPage() {
  const { payments, loading: paymentsLoading } = usePayments()
  const { transactions, loading: transactionsLoading } = useCreditTransactions()
  const { assignments, loading: assignmentsLoading } = useAssignments()
  const [activeTab, setActiveTab] = useState<TabType>('all')

  const loading = paymentsLoading || transactionsLoading || assignmentsLoading

  // Calculate totals
  const totalSpent = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0)
  
  const totalCreditsPurchased = payments
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.credits_purchased, 0)

  const totalCreditsEarned = transactions
    .filter(t => t.type === 'earned' || t.type === 'purchased')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalCreditsSpent = transactions
    .filter(t => t.type === 'spent')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Combine all history items with type
  const allHistory = [
    ...payments.map(p => ({
      id: p.id,
      type: 'payment' as const,
      date: p.created_at,
      title: `Payment - ${p.credits_purchased} credits`,
      description: `TZS ${p.amount.toLocaleString()} via ${p.payment_method}`,
      amount: p.amount,
      status: p.payment_status,
      credits: p.credits_purchased,
      transactionId: p.transaction_id,
      phone: p.phone_number,
    })),
    ...transactions.map(t => ({
      id: t.id,
      type: 'transaction' as const,
      date: t.created_at,
      title: t.description,
      description: t.type === 'earned' ? 'Credits earned' : t.type === 'purchased' ? 'Credits purchased' : 'Credits spent',
      amount: t.amount,
      status: 'completed' as const,
      credits: Math.abs(t.amount),
      transactionType: t.type,
    })),
    ...assignments.map(a => ({
      id: a.id,
      type: 'usage' as const,
      date: a.created_at,
      title: `${a.tool_type.charAt(0).toUpperCase() + a.tool_type.slice(1)} Tool Usage`,
      description: a.input_text.substring(0, 60) + (a.input_text.length > 60 ? '...' : ''),
      amount: 0,
      status: 'completed' as const,
      credits: a.credits_used,
      toolType: a.tool_type,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter based on active tab
  const filteredHistory = activeTab === 'all' 
    ? allHistory 
    : activeTab === 'payments'
    ? allHistory.filter(h => h.type === 'payment')
    : activeTab === 'transactions'
    ? allHistory.filter(h => h.type === 'transaction')
    : allHistory.filter(h => h.type === 'usage')

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: allHistory.length },
    { id: 'payments', label: 'Payments', count: payments.length },
    { id: 'transactions', label: 'Transactions', count: transactions.length },
    { id: 'usage', label: 'Usage', count: assignments.length },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Receipt className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Payment & Usage History</h1>
        </div>
        <p className="text-slate-400">
          Track all your payments, credit transactions, and tool usage
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            TZS {totalSpent.toLocaleString()}
          </h3>
          <p className="text-sm text-slate-400">Total Spent</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {totalCreditsPurchased.toLocaleString()}
          </h3>
          <p className="text-sm text-slate-400">Credits Purchased</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <ArrowUpCircle className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {totalCreditsEarned.toLocaleString()}
          </h3>
          <p className="text-sm text-slate-400">Credits Earned</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <ArrowDownCircle className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {totalCreditsSpent.toLocaleString()}
          </h3>
          <p className="text-sm text-slate-400">Credits Used</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-2"
      >
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* History List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
              <div className="h-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-12 text-center"
        >
          <Receipt className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No history found</h3>
          <p className="text-slate-400">
            {activeTab === 'all' 
              ? 'Start making payments or using tools to see your history here'
              : `No ${activeTab} history available yet`}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {filteredHistory.map((item, index) => {
            const date = new Date(item.date)
            const formattedDate = format(date, 'MMM dd, yyyy')
            const formattedTime = format(date, 'HH:mm')

            let icon, iconColor, iconBg, statusBadge

            if (item.type === 'payment') {
              icon = CreditCard
              iconColor = 'text-blue-400'
              iconBg = 'bg-blue-500/10'
              statusBadge = item.status === 'completed' ? (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Completed
                </span>
              ) : item.status === 'pending' ? (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Failed
                </span>
              )
            } else if (item.type === 'transaction') {
              if (item.transactionType === 'earned' || item.transactionType === 'purchased') {
                icon = ArrowUpCircle
                iconColor = 'text-emerald-400'
                iconBg = 'bg-emerald-500/10'
              } else {
                icon = ArrowDownCircle
                iconColor = 'text-red-400'
                iconBg = 'bg-red-500/10'
              }
              statusBadge = (
                <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-semibold rounded-full">
                  {item.transactionType}
                </span>
              )
            } else {
              icon = ShoppingCart
              iconColor = 'text-purple-400'
              iconBg = 'bg-purple-500/10'
              statusBadge = (
                <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-semibold rounded-full">
                  Used
                </span>
              )
            }

            const Icon = icon

            return (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-1">{item.description}</p>
                      </div>
                      {statusBadge}
                    </div>
                    
                    <div className="flex items-center gap-6 mt-3 flex-wrap">
                      {item.type === 'payment' && item.amount > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Amount:</span>
                          <span className="text-sm font-semibold text-white">
                            TZS {item.amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      
                      {item.credits > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Credits:</span>
                          <span className={`text-sm font-semibold ${
                            item.type === 'transaction' && item.transactionType === 'spent' 
                              ? 'text-red-400' 
                              : 'text-emerald-400'
                          }`}>
                            {item.type === 'transaction' && item.transactionType === 'spent' ? '-' : '+'}
                            {item.credits}
                          </span>
                        </div>
                      )}

                      {item.type === 'payment' && item.transactionId && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Transaction ID:</span>
                          <span className="text-xs font-mono text-slate-400">{item.transactionId}</span>
                        </div>
                      )}

                      {item.type === 'payment' && item.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Phone:</span>
                          <span className="text-xs text-slate-400">{item.phone}</span>
                        </div>
                      )}
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

