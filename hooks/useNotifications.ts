'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export type NotificationType = 
  | 'submission_approved'
  | 'submission_rejected'
  | 'submission_needs_revision'
  | 'submission_under_review'
  | 'achievement_unlocked'
  | 'payment_completed'
  | 'payment_failed'
  | 'credit_balance_low'
  | 'credit_balance_critical'
  | 'group_invitation'
  | 'group_member_joined'
  | 'review_feedback'
  | 'leaderboard_position_changed'
  | 'credits_awarded'
  | 'system_announcement'
  | 'deadline_reminder'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  action_url: string | null
  action_label: string | null
  metadata: Record<string, any>
  aggregation_key: string | null
  aggregation_count: number
  is_read: boolean
  read_at: string | null
  should_show_immediately: boolean
  scheduled_for: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

interface UseNotificationsOptions {
  limit?: number
  unreadOnly?: boolean
  priority?: NotificationPriority
  enableRealtime?: boolean
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    limit = 20,
    unreadOnly = false,
    priority,
    enableRealtime = true,
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const supabase = createClient()

  const fetchNotifications = useCallback(async (offset = 0) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(unreadOnly && { unread_only: 'true' }),
        ...(priority && { priority }),
      })

      const response = await fetch(`/api/notifications?${params}`, {
        credentials: 'include', // Ensure cookies are sent
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      
      if (offset === 0) {
        setNotifications(data.notifications || [])
      } else {
        setNotifications(prev => [...prev, ...(data.notifications || [])])
      }
      
      setUnreadCount(data.unreadCount || 0)
      setHasMore(data.hasMore || false)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [limit, unreadOnly, priority])

  const markAsRead = useCallback(async (notificationId: string, actionTaken = false) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_taken: actionTaken }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }

      // Optimistically update UI
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
      // Revert on error
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }

      // Optimistically update UI
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete notification')
      }

      // Optimistically update UI
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      // Update unread count if it was unread
      const notification = notifications.find(n => n.id === notificationId)
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
      await fetchNotifications()
    }
  }, [notifications, fetchNotifications])

  const refresh = useCallback(() => {
    fetchNotifications(0)
  }, [fetchNotifications])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(notifications.length)
    }
  }, [loading, hasMore, notifications.length, fetchNotifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications(0)
  }, [fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    if (!enableRealtime) return

    let channel: ReturnType<typeof supabase.channel> | null = null

    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Notification change:', payload)
            
            if (payload.eventType === 'INSERT') {
              const newNotification = payload.new as Notification
              setNotifications(prev => [newNotification, ...prev])
              if (!newNotification.is_read) {
                setUnreadCount(prev => prev + 1)
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedNotification = payload.new as Notification
              setNotifications(prev =>
                prev.map(n =>
                  n.id === updatedNotification.id ? updatedNotification : n
                )
              )
              // Update unread count if read status changed
              const oldNotification = payload.old as Notification
              if (oldNotification.is_read !== updatedNotification.is_read) {
                if (updatedNotification.is_read) {
                  setUnreadCount(prev => Math.max(0, prev - 1))
                } else {
                  setUnreadCount(prev => prev + 1)
                }
              }
            } else if (payload.eventType === 'DELETE') {
              const deletedNotification = payload.old as Notification
              setNotifications(prev => prev.filter(n => n.id !== deletedNotification.id))
              if (!deletedNotification.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
              }
            }
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [enableRealtime, supabase])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
    loadMore,
  }
}

