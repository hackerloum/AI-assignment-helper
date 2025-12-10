/**
 * Intelligent Notification Service
 * Provides utilities for creating and managing notifications with intelligent features
 */

import { createAdminClient } from "@/lib/supabase/server";

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

interface CreateNotificationParams {
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority
  action_url?: string
  action_label?: string
  metadata?: Record<string, any>
  aggregation_key?: string
  should_show_immediately?: boolean
  scheduled_for?: Date
}

/**
 * Create an intelligent notification
 * This function uses the database function which handles:
 * - User preference checking
 * - Notification aggregation
 * - Priority filtering
 * - Smart timing
 */
export async function createNotification(params: CreateNotificationParams): Promise<string | null> {
  try {
    const supabase = createAdminClient()

    const { data: notificationId, error } = await supabase.rpc(
      'create_intelligent_notification',
      {
        p_user_id: params.user_id,
        p_type: params.type,
        p_title: params.title,
        p_message: params.message,
        p_priority: params.priority || 'medium',
        p_action_url: params.action_url || null,
        p_action_label: params.action_label || null,
        p_metadata: params.metadata || {},
        p_aggregation_key: params.aggregation_key || null,
        p_should_show_immediately: params.should_show_immediately !== false,
        p_scheduled_for: params.scheduled_for?.toISOString() || null,
      }
    )

    if (error) {
      console.error('[Notification Service] Error creating notification:', error)
      return null
    }

    return notificationId
  } catch (error) {
    console.error('[Notification Service] Unexpected error:', error)
    return null
  }
}

/**
 * Create a batch of notifications for multiple users
 * Useful for system announcements
 */
export async function createBatchNotifications(
  user_ids: string[],
  params: Omit<CreateNotificationParams, 'user_id'>
): Promise<number> {
  let successCount = 0

  for (const user_id of user_ids) {
    const notificationId = await createNotification({
      ...params,
      user_id,
    })
    if (notificationId) {
      successCount++
    }
  }

  return successCount
}

/**
 * Create a system announcement notification
 */
export async function createSystemAnnouncement(
  user_ids: string[],
  title: string,
  message: string,
  action_url?: string,
  priority: NotificationPriority = 'medium'
): Promise<number> {
  return createBatchNotifications(user_ids, {
    type: 'system_announcement',
    title,
    message,
    priority,
    action_url,
    action_label: action_url ? 'Learn More' : undefined,
    should_show_immediately: priority === 'urgent' || priority === 'high',
  })
}

/**
 * Check and notify users with low credit balance
 * This should be called periodically (e.g., via cron job)
 */
export async function checkAndNotifyLowCredits(): Promise<void> {
  try {
    const supabase = createAdminClient()
    await supabase.rpc('check_and_notify_low_credits')
  } catch (error) {
    console.error('[Notification Service] Error checking low credits:', error)
  }
}

/**
 * Initialize notification preferences for a new user
 */
export async function initializeUserPreferences(user_id: string): Promise<void> {
  try {
    const supabase = createAdminClient()
    
    // Get all notification types
    const notificationTypes = [
      'submission_approved',
      'submission_rejected',
      'submission_needs_revision',
      'submission_under_review',
      'achievement_unlocked',
      'payment_completed',
      'payment_failed',
      'credit_balance_low',
      'credit_balance_critical',
      'group_invitation',
      'group_member_joined',
      'review_feedback',
      'leaderboard_position_changed',
      'credits_awarded',
      'system_announcement',
      'deadline_reminder',
    ]

    // Create default preferences
    const preferences = notificationTypes.map(type => ({
      user_id,
      notification_type: type,
      enabled: true,
      email_enabled: false,
      push_enabled: false,
      allow_aggregation: true,
      min_priority: 'low' as const,
    }))

    await supabase.from('notification_preferences').insert(preferences)
  } catch (error) {
    console.error('[Notification Service] Error initializing preferences:', error)
  }
}

