'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  CheckCheck, 
  X, 
  ExternalLink,
  Settings,
  Filter,
  Search
} from 'lucide-react'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { useRouter } from 'next/navigation'
// Helper functions
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500'
    case 'high':
      return 'bg-orange-500'
    case 'medium':
      return 'bg-blue-500'
    case 'low':
      return 'bg-slate-500'
    default:
      return 'bg-slate-500'
  }
}

function getNotificationIcon(type: string): string {
  const iconMap: Record<string, string> = {
    submission_approved: '✅',
    submission_rejected: '❌',
    submission_needs_revision: '📝',
    submission_under_review: '👀',
    achievement_unlocked: '🏆',
    payment_completed: '💳',
    payment_failed: '⚠️',
    credit_balance_low: '💰',
    credit_balance_critical: '🔴',
    group_invitation: '👥',
    group_member_joined: '➕',
    review_feedback: '💬',
    leaderboard_position_changed: '📊',
    credits_awarded: '🎁',
    system_announcement: '📢',
    deadline_reminder: '⏰',
  }
  return iconMap[type] || '🔔'
}

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadMore,
    hasMore,
  } = useNotifications({ 
    limit: 50,
    unreadOnly: filter === 'unread',
    enableRealtime: true,
  })

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id, true)
    }
    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    // Priority filter
    if (priorityFilter !== 'all' && notification.priority !== priorityFilter) {
      return false
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.type.toLowerCase().includes(query)
      )
    }

    return true
  })

  return (
    <div className="min-h-screen bg-dashboard-bg p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
              <p className="text-slate-400">
                {unreadCount > 0 ? (
                  <span>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</span>
                ) : (
                  <span>All caught up!</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-400 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-dashboard-elevated border border-dashboard-border rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filter === 'unread'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filter === 'read'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Read
              </button>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-dashboard-elevated border border-dashboard-border rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-dashboard-elevated border border-dashboard-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent mb-4"></div>
              <p className="text-slate-400">Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">No notifications found</p>
              <p className="text-slate-500 text-sm">
                {searchQuery || filter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "You're all caught up!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-dashboard-elevated border border-dashboard-border rounded-xl p-4 hover:border-amber-500/30 transition-colors ${
                  !notification.is_read ? 'bg-amber-500/5 border-amber-500/20' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Priority indicator and icon */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className={`w-3 h-3 ${getPriorityColor(notification.priority)} rounded-full`} />
                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`font-semibold ${
                        !notification.is_read ? 'text-white' : 'text-slate-300'
                      }`}>
                        {notification.title}
                        {notification.aggregation_count > 1 && (
                          <span className="ml-2 text-xs text-amber-400 font-normal">
                            ({notification.aggregation_count} similar)
                          </span>
                        )}
                      </h3>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-slate-400 mb-3">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        {formatTimeAgo(notification.created_at)}
                      </p>
                      {notification.action_url && (
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                          <span>{notification.action_label || 'View'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1 flex-shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4 text-slate-400" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 bg-dashboard-elevated border border-dashboard-border rounded-lg text-sm text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

