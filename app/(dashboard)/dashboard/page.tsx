'use client'

import { motion } from 'framer-motion'
import { 
  FileText, 
  RefreshCw, 
  Shield, 
  FileCode, 
  Presentation,
  TrendingUp,
  Zap,
  Clock,
  ArrowRight,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import { CreditCounter } from '@/components/dashboard/CreditCounter'
import { UsageChart } from '@/components/dashboard/UsageChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PaymentHistoryWidget } from '@/components/dashboard/PaymentHistoryWidget'
import { useUser } from '@/hooks/useUser'
import { useUsageStats } from '@/hooks/useUsageStats'
import { useAssignments } from '@/hooks/useAssignments'
import { useCredits } from '@/hooks/useCredits'

const tools = [
  {
    name: 'Assignment Writer',
    description: 'Create properly formatted academic assignments with templates',
    href: '/assignment',
    icon: BookOpen,
    color: 'from-indigo-500 to-purple-500',
    textColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    toolType: 'essay' as const,
  },
  {
    name: 'AI Research Assistant',
    description: 'Get comprehensive answers to any research question',
    href: '/research',
    icon: FileText,
    color: 'from-blue-500 to-cyan-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    toolType: 'essay' as const,
  },
  {
    name: 'Grammar & Rewrite',
    description: 'Transform your text into polished academic writing',
    href: '/rewrite',
    icon: RefreshCw,
    color: 'from-purple-500 to-pink-500',
    textColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    toolType: 'grammar' as const,
  },
  {
    name: 'Plagiarism Checker',
    description: 'Ensure your work is 100% original',
    href: '/plagiarism',
    icon: Shield,
    color: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    toolType: 'paraphrase' as const,
  },
  {
    name: 'APA Referencing',
    description: 'Generate perfect citations instantly',
    href: '/referencing',
    icon: FileCode,
    color: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    toolType: 'citation' as const,
  },
  {
    name: 'PowerPoint Maker',
    description: 'Create professional presentations in seconds',
    href: '/powerpoint',
    icon: Presentation,
    color: 'from-pink-500 to-rose-500',
    textColor: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    toolType: 'summarizer' as const,
  },
]

export default function DashboardPage() {
  const { user } = useUser()
  const { stats: usageStats, loading: statsLoading } = useUsageStats()
  const { assignments, loading: assignmentsLoading } = useAssignments()
  const { credits } = useCredits()

  // Calculate tool usage stats
  const toolStats = tools.map(tool => {
    const used = assignments.filter(a => a.tool_type === tool.toolType).length
    return {
      ...tool,
      stats: { used, total: credits || 50 },
    }
  })

  // Calculate time saved (estimate: 30 minutes per assignment)
  const timeSavedHours = (usageStats.totalAssignments * 0.5).toFixed(1)

  const dashboardStats = [
    {
      name: 'Tools Used Today',
      value: usageStats.toolsUsedToday.toString(),
      change: '',
      trend: 'up' as const,
      icon: Zap,
    },
    {
      name: 'Time Saved',
      value: `${timeSavedHours}h`,
      change: '',
      trend: 'up' as const,
      icon: Clock,
    },
    {
      name: 'Total Assignments',
      value: usageStats.totalAssignments.toString(),
      change: '',
      trend: 'up' as const,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-lg text-slate-400">
          Let&apos;s make today academically productive
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {dashboardStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 overflow-hidden group hover:border-amber-500/30 transition-all duration-300"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.icon === Zap ? 'bg-amber-500/10' : stat.icon === Clock ? 'bg-blue-500/10' : 'bg-emerald-500/10'} rounded-xl`}>
                  <stat.icon className={`w-6 h-6 ${stat.icon === Zap ? 'text-amber-400' : stat.icon === Clock ? 'text-blue-400' : 'text-emerald-400'}`} />
                </div>
                <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-400">{stat.name}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tools (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* AI Tools Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">AI Tools</h2>
              <Link 
                href="/history"
                className="text-sm text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {toolStats.map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={tool.href}>
                    <div className="relative bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 overflow-hidden group hover:border-amber-500/30 transition-all duration-300 cursor-pointer h-full">
                      {/* Hover gradient effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      
                      <div className="relative">
                        {/* Icon */}
                        <div className={`${tool.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <tool.icon className={`w-6 h-6 ${tool.textColor}`} />
                        </div>

                        {/* Content */}
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {tool.description}
                        </p>

                        {/* Usage stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                              <span>Usage</span>
                              <span>{tool.stats.used}/{tool.stats.total}</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full bg-gradient-to-r ${tool.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(tool.stats.used / tool.stats.total) * 100}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                          
                          <ArrowRight className={`w-5 h-5 ${tool.textColor} ml-4 group-hover:translate-x-1 transition-transform`} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Credits & Activity (1/3 width) */}
        <div className="space-y-6">
          {/* Credits Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CreditCounter />
          </motion.div>

          {/* Usage Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <UsageChart />
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <RecentActivity />
          </motion.div>

          {/* Payment History Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PaymentHistoryWidget />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

