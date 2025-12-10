'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Menu, 
  Command,
  User,
  ChevronDown,
  Check,
  CheckCheck,
  X,
  ExternalLink,
  Settings
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { useNotifications, Notification } from '@/hooks/useNotifications'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  onMenuClick: () => void
  onCommandClick: () => void
}

// Helper function to format time ago
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

// Helper function to get priority color
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

// Helper function to get notification icon
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

export function TopBar({ onMenuClick, onCommandClick }: TopBarProps) {
  const { user } = useUser()
  const router = useRouter()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications({ limit: 10, enableRealtime: true })

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false)
      }
    }

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen])

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id, true)
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      router.push(notification.action_url)
      setNotificationsOpen(false)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  return (
    <header className="sticky top-0 z-30 bg-dashboard-bg/80 backdrop-blur-xl border-b border-dashboard-border">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </button>

          {/* Breadcrumb - Hidden on mobile */}
          <div className="hidden md:block">
            <Breadcrumb />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Command Palette Button */}
          <motion.button
            onClick={onCommandClick}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-dashboard-border rounded-lg transition-colors group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
              Search...
            </span>
            <div className="flex items-center gap-0.5 ml-2">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-slate-400">
                <Command className="w-3 h-3" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-slate-400">
                K
              </kbd>
            </div>
          </motion.button>

          {/* Mobile Search Button */}
          <button
            onClick={onCommandClick}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-slate-400" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <motion.button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-slate-400" />
              {/* Notification badge */}
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center px-1"
                >
                  <span className="text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-96 bg-dashboard-elevated border border-dashboard-border rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-dashboard-border flex items-center justify-between">
                    <h3 className="font-semibold text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => router.push('/dashboard/settings')}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[500px] overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-amber-400 border-t-transparent"></div>
                        <p className="text-sm text-slate-400 mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm text-slate-400">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-dashboard-border">
                        {notifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                              !notification.is_read ? 'bg-amber-500/5' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="flex items-start gap-3">
                              {/* Priority indicator */}
                              <div className={`w-2 h-2 ${getPriorityColor(notification.priority)} rounded-full mt-2 flex-shrink-0`} />
                              
                              {/* Icon */}
                              <div className="text-xl flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <p className={`text-sm font-medium ${
                                    !notification.is_read ? 'text-white' : 'text-slate-300'
                                  }`}>
                                    {notification.title}
                                    {notification.aggregation_count > 1 && (
                                      <span className="ml-2 text-xs text-amber-400">
                                        ({notification.aggregation_count})
                                      </span>
                                    )}
                                  </p>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-1.5" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
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
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                    title="Mark as read"
                                  >
                                    <Check className="w-4 h-4 text-slate-400" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                  className="p-1 hover:bg-red-500/10 rounded transition-colors"
                                  title="Delete"
                                >
                                  <X className="w-4 h-4 text-slate-400 hover:text-red-400" />
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-dashboard-border text-center">
                      <button
                        onClick={() => {
                          router.push('/dashboard/notifications')
                          setNotificationsOpen(false)
                        }}
                        className="text-sm text-amber-400 hover:text-amber-300 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </motion.button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-64 bg-dashboard-elevated border border-dashboard-border rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-dashboard-border">
                  <p className="text-sm font-semibold text-white">
                    {user?.user_metadata?.full_name || 'Student'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                    Billing
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

