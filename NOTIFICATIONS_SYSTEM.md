# Intelligent Notifications System

## Overview

A comprehensive, intelligent notification system integrated with the gamification and submission system. The system includes automatic notification generation, intelligent aggregation, priority-based filtering, user preferences, and real-time updates.

## Features

### 🧠 Intelligent Features

1. **Automatic Notification Generation**
   - Triggers automatically on key events (submission status changes, achievements, payments, etc.)
   - No manual intervention required

2. **Smart Aggregation**
   - Groups similar notifications together (e.g., "3 new achievements" instead of 3 separate notifications)
   - Reduces notification fatigue
   - Configurable per user preference

3. **Priority-Based System**
   - Four priority levels: `low`, `medium`, `high`, `urgent`
   - Visual indicators (color-coded)
   - Users can filter by minimum priority

4. **Smart Timing**
   - Avoids notification fatigue
   - Can schedule notifications for later
   - Immediate notifications for urgent items
   - Auto-expiry for old notifications

5. **User Preferences**
   - Per-notification-type preferences
   - Enable/disable specific notification types
   - Control aggregation behavior
   - Set minimum priority threshold

6. **Actionable Notifications**
   - Deep links to relevant pages
   - Action buttons (e.g., "View Submission", "View Achievement")
   - Click tracking for engagement analytics

7. **Real-Time Updates**
   - Live notifications via Supabase real-time subscriptions
   - No page refresh needed
   - Instant updates across all devices

## Database Schema

### Tables

#### `notifications`
Main notifications table with all notification data.

**Key Fields:**
- `type`: Notification type (enum)
- `priority`: Priority level (low, medium, high, urgent)
- `aggregation_key`: For grouping similar notifications
- `aggregation_count`: Number of aggregated notifications
- `action_url`: Deep link to relevant page
- `action_label`: Button text
- `metadata`: Additional context (JSONB)
- `scheduled_for`: For delayed notifications
- `expires_at`: Auto-archive old notifications

#### `notification_preferences`
User preferences for notification types.

**Key Fields:**
- `notification_type`: Type of notification
- `enabled`: Whether this type is enabled
- `email_enabled`: Email delivery (future)
- `push_enabled`: Push notification (future)
- `allow_aggregation`: Allow grouping similar notifications
- `min_priority`: Minimum priority to show

#### `notification_read_receipts`
Tracks when users read notifications and take actions.

**Key Fields:**
- `action_taken`: Whether user clicked action button
- `action_taken_at`: Timestamp of action

### Database Functions

#### `create_intelligent_notification()`
Creates notifications with intelligent features:
- Checks user preferences
- Handles aggregation
- Filters by priority
- Returns notification ID

#### `mark_notification_read()`
Marks a notification as read and creates a read receipt.

#### `mark_all_notifications_read()`
Marks all notifications as read for a user.

#### `get_unread_notification_count()`
Returns count of unread notifications.

#### `check_and_notify_low_credits()`
Checks for users with low credits and creates notifications (should be called periodically).

### Triggers

Automatic notifications are created via database triggers:

1. **Submission Status Changes** (`trigger_notify_submission_status`)
   - When submission is approved, rejected, needs revision, or under review
   - Includes credits awarded information

2. **Achievement Unlocked** (`trigger_notify_achievement`)
   - When user earns a new achievement
   - Includes achievement details and bonus credits

3. **Payment Completed** (`trigger_notify_payment`)
   - When payment status changes to completed
   - Includes payment amount and credits purchased

4. **Credits Awarded** (`trigger_notify_credits_awarded`)
   - When credits are awarded from submissions
   - Shows amount and submission details

5. **Group Invitation** (`trigger_notify_group_invitation`)
   - When user is added to a group
   - Includes group name and role

## API Endpoints

### `GET /api/notifications`
Get user's notifications.

**Query Parameters:**
- `limit`: Number of notifications (default: 20)
- `offset`: Pagination offset (default: 0)
- `unread_only`: Filter unread only (default: false)
- `priority`: Filter by priority level

**Response:**
```json
{
  "notifications": [...],
  "unreadCount": 5,
  "hasMore": true
}
```

### `POST /api/notifications`
Create a notification (admin/service role only).

**Body:**
```json
{
  "user_id": "uuid",
  "type": "submission_approved",
  "title": "Submission Approved!",
  "message": "Your submission has been approved.",
  "priority": "high",
  "action_url": "/dashboard/submissions/123",
  "action_label": "View Submission",
  "metadata": {},
  "aggregation_key": "submission_123",
  "should_show_immediately": true
}
```

### `PATCH /api/notifications/[id]`
Mark notification as read.

**Body:**
```json
{
  "action_taken": true
}
```

### `DELETE /api/notifications/[id]`
Delete a notification.

### `POST /api/notifications/mark-all-read`
Mark all notifications as read.

### `GET /api/notifications/preferences`
Get user's notification preferences.

### `PUT /api/notifications/preferences`
Update notification preferences.

**Body:**
```json
{
  "notification_type": "submission_approved",
  "enabled": true,
  "email_enabled": false,
  "push_enabled": false,
  "allow_aggregation": true,
  "min_priority": "low"
}
```

## Frontend Components

### `useNotifications` Hook

React hook for managing notifications with real-time updates.

**Usage:**
```typescript
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
  limit: 20,
  unreadOnly: false,
  priority: 'high',
  enableRealtime: true,
})
```

**Features:**
- Real-time subscriptions
- Optimistic UI updates
- Automatic refresh
- Pagination support

### `TopBar` Component

Updated notification bell with:
- Unread count badge
- Real-time updates
- Priority indicators
- Action buttons
- Aggregation display

### Notifications Page (`/dashboard/notifications`)

Full-featured notifications page with:
- Filter by status (all/unread/read)
- Filter by priority
- Search functionality
- Mark all as read
- Individual notification actions
- Load more pagination

## Notification Types

1. **Submission Notifications**
   - `submission_approved`: Submission approved with credits
   - `submission_rejected`: Submission rejected
   - `submission_needs_revision`: Revision required
   - `submission_under_review`: Currently under review

2. **Achievement Notifications**
   - `achievement_unlocked`: New achievement earned

3. **Payment Notifications**
   - `payment_completed`: Payment successful
   - `payment_failed`: Payment failed

4. **Credit Notifications**
   - `credit_balance_low`: Low balance warning
   - `credit_balance_critical`: Critical balance warning
   - `credits_awarded`: Credits earned

5. **Group Notifications**
   - `group_invitation`: Invited to group
   - `group_member_joined`: New member joined

6. **System Notifications**
   - `review_feedback`: Review feedback available
   - `leaderboard_position_changed`: Position changed
   - `system_announcement`: System-wide announcement
   - `deadline_reminder`: Deadline approaching

## Usage Examples

### Creating a Notification (Server-Side)

```typescript
import { createNotification } from '@/lib/notifications'

await createNotification({
  user_id: userId,
  type: 'submission_approved',
  title: 'Submission Approved! 🎉',
  message: 'Your submission has been approved. You earned 50 credits!',
  priority: 'high',
  action_url: `/dashboard/submissions/${submissionId}`,
  action_label: 'View Submission',
  metadata: {
    submission_id: submissionId,
    credits_awarded: 50,
  },
})
```

### Creating System Announcement

```typescript
import { createSystemAnnouncement } from '@/lib/notifications'

// Get all user IDs
const { data: users } = await supabase
  .from('user_credits')
  .select('user_id')

const userIds = users.map(u => u.user_id)

await createSystemAnnouncement(
  userIds,
  'New Feature Available!',
  'Check out our new AI-powered research tool.',
  '/dashboard/research',
  'medium'
)
```

### Checking Low Credits (Cron Job)

```typescript
import { checkAndNotifyLowCredits } from '@/lib/notifications'

// Run this periodically (e.g., daily)
await checkAndNotifyLowCredits()
```

## Migration

Run the migration file:

```sql
-- Run in Supabase SQL Editor
\i supabase/migrations/007_intelligent_notifications.sql
```

Or copy and paste the contents of `supabase/migrations/007_intelligent_notifications.sql` into the Supabase SQL Editor.

## Initialization

After running the migration, initialize preferences for existing users:

```sql
SELECT initialize_notification_preferences();
```

For new users, call this in your signup handler:

```typescript
import { initializeUserPreferences } from '@/lib/notifications'

await initializeUserPreferences(userId)
```

## Best Practices

1. **Use Aggregation Keys**
   - Group similar notifications to reduce noise
   - Example: `submission_123_approved` groups all updates for submission 123

2. **Set Appropriate Priorities**
   - `urgent`: Critical actions required (e.g., payment failed, critical credits)
   - `high`: Important updates (e.g., submission approved, achievement)
   - `medium`: Regular updates (e.g., under review, low credits)
   - `low`: Informational (e.g., system announcements)

3. **Provide Action URLs**
   - Always include `action_url` for actionable notifications
   - Use descriptive `action_label` text

4. **Use Metadata**
   - Store additional context in `metadata` field
   - Useful for custom rendering or analytics

5. **Respect User Preferences**
   - Always check preferences before creating notifications
   - The `create_intelligent_notification` function handles this automatically

6. **Monitor Notification Fatigue**
   - Use aggregation to group similar notifications
   - Schedule non-urgent notifications for later
   - Set appropriate expiry times

## Future Enhancements

1. **Email Notifications**
   - Implement email delivery for important notifications
   - Respect `email_enabled` preference

2. **Push Notifications**
   - Browser push notifications
   - Mobile app push notifications
   - Respect `push_enabled` preference

3. **Notification Templates**
   - Reusable notification templates
   - Customizable message formatting

4. **Analytics Dashboard**
   - Notification engagement metrics
   - Read rates
   - Action click rates
   - User preference insights

5. **Notification Scheduling**
   - Batch notifications for optimal delivery times
   - Timezone-aware scheduling
   - Quiet hours support

6. **Advanced Aggregation**
   - Machine learning for smart grouping
   - Context-aware aggregation
   - User behavior-based grouping

## Troubleshooting

### Notifications Not Appearing

1. Check user preferences - notification type might be disabled
2. Check priority - might be below user's minimum priority
3. Check expiry - notification might have expired
4. Check scheduled_for - notification might be scheduled for later

### Real-Time Notifications Not Working

1. Ensure Supabase real-time is enabled for the `notifications` table
2. Check that the user is authenticated
3. Verify the subscription is active in browser console

### Performance Issues

1. Use indexes (already created in migration)
2. Limit notification history (auto-expiry)
3. Use pagination for large notification lists
4. Consider archiving old notifications

## Support

For issues or questions, check:
- Database migration: `supabase/migrations/007_intelligent_notifications.sql`
- API routes: `app/api/notifications/`
- Frontend hook: `hooks/useNotifications.ts`
- Service functions: `lib/notifications.ts`

