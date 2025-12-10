-- Migration: Intelligent Notifications System
-- Creates a comprehensive notification system with intelligent features:
-- - Priority-based notifications
-- - Notification aggregation
-- - Smart timing (avoid notification fatigue)
-- - Context-aware notifications
-- - User preferences
-- - Actionable notifications with deep links

-- Notification Types Enum
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
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
    'deadline_reminder'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Priority Levels
DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Content
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'medium',
  
  -- Actionable Data
  action_url TEXT, -- Deep link to relevant page
  action_label TEXT, -- Button text (e.g., "View Submission", "View Achievement")
  metadata JSONB DEFAULT '{}'::JSONB, -- Additional context data
  
  -- Aggregation (for grouping similar notifications)
  aggregation_key TEXT, -- Groups similar notifications together
  aggregation_count INTEGER DEFAULT 1, -- Count of aggregated notifications
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Smart Timing
  should_show_immediately BOOLEAN DEFAULT true, -- Override for urgent notifications
  scheduled_for TIMESTAMP WITH TIME ZONE, -- For delayed notifications
  
  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE, -- Auto-archive old notifications
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification Preferences (User can customize what they want to receive)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Preference Settings
  notification_type notification_type NOT NULL,
  enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  
  -- Smart Features
  allow_aggregation BOOLEAN DEFAULT true, -- Allow grouping similar notifications
  min_priority notification_priority DEFAULT 'low', -- Minimum priority to show
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, notification_type)
);

-- Notification Read Receipts (for tracking engagement)
CREATE TABLE IF NOT EXISTS notification_read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action_taken BOOLEAN DEFAULT false, -- Whether user clicked the action button
  action_taken_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_aggregation ON notifications(user_id, aggregation_key, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_notification ON notification_read_receipts(notification_id);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON notification_read_receipts(user_id);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notification_read_receipts
CREATE POLICY "Users can view own read receipts"
  ON notification_read_receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own read receipts"
  ON notification_read_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to create notification with intelligent features
CREATE OR REPLACE FUNCTION create_intelligent_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_priority notification_priority DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB,
  p_aggregation_key TEXT DEFAULT NULL,
  p_should_show_immediately BOOLEAN DEFAULT true,
  p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preference notification_preferences%ROWTYPE;
  v_aggregation_count INTEGER;
BEGIN
  -- Check user preference
  SELECT * INTO v_preference
  FROM notification_preferences
  WHERE user_id = p_user_id AND notification_type = p_type;
  
  -- If preference exists and is disabled, don't create notification
  IF v_preference.id IS NOT NULL AND v_preference.enabled = false THEN
    RETURN NULL;
  END IF;
  
  -- Check minimum priority preference
  IF v_preference.id IS NOT NULL AND 
     (SELECT priority_level FROM (
       SELECT 'low' as priority_level, 1 as level
       UNION ALL SELECT 'medium', 2
       UNION ALL SELECT 'high', 3
       UNION ALL SELECT 'urgent', 4
     ) p WHERE p.priority_level = p_priority::TEXT) < 
     (SELECT priority_level FROM (
       SELECT 'low' as priority_level, 1 as level
       UNION ALL SELECT 'medium', 2
       UNION ALL SELECT 'high', 3
       UNION ALL SELECT 'urgent', 4
     ) p WHERE p.priority_level = v_preference.min_priority::TEXT) THEN
    RETURN NULL;
  END IF;
  
  -- Check for aggregation if enabled and aggregation_key provided
  IF p_aggregation_key IS NOT NULL AND 
     (v_preference.id IS NULL OR v_preference.allow_aggregation = true) THEN
    -- Find existing unread notification with same aggregation key
    SELECT id, aggregation_count INTO v_notification_id, v_aggregation_count
    FROM notifications
    WHERE user_id = p_user_id
      AND aggregation_key = p_aggregation_key
      AND is_read = false
      AND created_at > NOW() - INTERVAL '1 hour' -- Only aggregate within last hour
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If found, update aggregation count instead of creating new
    IF v_notification_id IS NOT NULL THEN
      UPDATE notifications
      SET 
        aggregation_count = aggregation_count + 1,
        message = p_message, -- Update with latest message
        metadata = p_metadata, -- Update with latest metadata
        updated_at = NOW()
      WHERE id = v_notification_id;
      
      RETURN v_notification_id;
    END IF;
  END IF;
  
  -- Create new notification
  INSERT INTO notifications (
    user_id, type, title, message, priority,
    action_url, action_label, metadata,
    aggregation_key, should_show_immediately, scheduled_for,
    expires_at
  )
  VALUES (
    p_user_id, p_type, p_title, p_message, p_priority,
    p_action_url, p_action_label, p_metadata,
    p_aggregation_key, p_should_show_immediately, p_scheduled_for,
    CASE 
      WHEN p_type IN ('system_announcement', 'deadline_reminder') THEN NOW() + INTERVAL '30 days'
      ELSE NOW() + INTERVAL '7 days'
    END
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID,
  p_action_taken BOOLEAN DEFAULT false
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM notifications WHERE id = p_notification_id AND user_id = p_user_id) THEN
    RETURN false;
  END IF;
  
  -- Update notification
  UPDATE notifications
  SET 
    is_read = true,
    read_at = NOW(),
    updated_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  -- Create read receipt
  INSERT INTO notification_read_receipts (notification_id, user_id, action_taken, action_taken_at)
  VALUES (p_notification_id, p_user_id, p_action_taken, CASE WHEN p_action_taken THEN NOW() ELSE NULL END)
  ON CONFLICT DO NOTHING;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET 
    is_read = true,
    read_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false
    AND (scheduled_for IS NULL OR scheduled_for <= NOW())
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGERS FOR AUTOMATIC NOTIFICATIONS
-- ============================================

-- Trigger: Submission Status Changed
CREATE OR REPLACE FUNCTION notify_submission_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_priority notification_priority;
  v_action_url TEXT;
  v_action_label TEXT;
BEGIN
  -- Only notify on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Determine notification details based on new status
  CASE NEW.status
    WHEN 'approved' THEN
      v_title := 'Submission Approved! 🎉';
      v_message := format('Your submission "%s" has been approved. You earned %s credits!', 
                         NEW.title, COALESCE(NEW.credits_awarded, 0));
      v_priority := 'high';
      v_action_url := format('/dashboard/submissions/%s', NEW.id);
      v_action_label := 'View Submission';
      
    WHEN 'rejected' THEN
      v_title := 'Submission Needs Attention';
      v_message := format('Your submission "%s" was rejected. Please review the feedback.', NEW.title);
      v_priority := 'medium';
      v_action_url := format('/dashboard/submissions/%s', NEW.id);
      v_action_label := 'View Feedback';
      
    WHEN 'needs_revision' THEN
      v_title := 'Revision Required';
      v_message := format('Your submission "%s" needs revision. Check the feedback and resubmit.', NEW.title);
      v_priority := 'medium';
      v_action_url := format('/dashboard/submissions/%s', NEW.id);
      v_action_label := 'View Feedback';
      
    WHEN 'under_review' THEN
      v_title := 'Submission Under Review';
      v_message := format('Your submission "%s" is now under review. We''ll notify you when it''s complete.', NEW.title);
      v_priority := 'low';
      v_action_url := format('/dashboard/submissions/%s', NEW.id);
      v_action_label := 'View Submission';
      
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Create notification
  PERFORM create_intelligent_notification(
    NEW.user_id,
    CASE NEW.status
      WHEN 'approved' THEN 'submission_approved'::notification_type
      WHEN 'rejected' THEN 'submission_rejected'::notification_type
      WHEN 'needs_revision' THEN 'submission_needs_revision'::notification_type
      WHEN 'under_review' THEN 'submission_under_review'::notification_type
    END,
    v_title,
    v_message,
    v_priority,
    v_action_url,
    v_action_label,
    jsonb_build_object(
      'submission_id', NEW.id,
      'submission_title', NEW.title,
      'status', NEW.status,
      'credits_awarded', NEW.credits_awarded,
      'quality_score', NEW.quality_score
    ),
    format('submission_%s_%s', NEW.id, NEW.status), -- Aggregation key
    true, -- Show immediately
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_submission_status
  AFTER UPDATE OF status ON assignment_submissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_submission_status_change();

-- Trigger: Achievement Unlocked
CREATE OR REPLACE FUNCTION notify_achievement_unlocked()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_intelligent_notification(
    NEW.user_id,
    'achievement_unlocked'::notification_type,
    format('Achievement Unlocked: %s! 🏆', NEW.achievement_name),
    format('Congratulations! You earned the "%s" achievement. %s', 
           NEW.achievement_name, 
           COALESCE(NEW.description, '')),
    'high',
    '/dashboard/achievements',
    'View Achievements',
    jsonb_build_object(
      'achievement_type', NEW.achievement_type,
      'achievement_name', NEW.achievement_name,
      'credits_bonus', NEW.credits_bonus
    ),
    format('achievement_%s', NEW.achievement_type),
    true,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_achievement
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_unlocked();

-- Trigger: Payment Completed
CREATE OR REPLACE FUNCTION notify_payment_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    PERFORM create_intelligent_notification(
      NEW.user_id,
      'payment_completed'::notification_type,
      'Payment Completed Successfully! ✅',
      format('Your payment of %s TZS has been processed. Credits have been added to your account.', 
             NEW.amount),
      'high',
      '/dashboard/payment-history',
      'View Payment',
      jsonb_build_object(
        'payment_id', NEW.id,
        'amount', NEW.amount,
        'credits_purchased', NEW.credits_purchased
      ),
      format('payment_%s', NEW.id),
      true,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_payment
  AFTER UPDATE OF payment_status ON payments
  FOR EACH ROW
  WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
  EXECUTE FUNCTION notify_payment_completed();

-- Trigger: Credits Awarded (from submissions)
CREATE OR REPLACE FUNCTION notify_credits_awarded()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.credits_awarded > 0 AND (OLD.credits_awarded IS NULL OR OLD.credits_awarded != NEW.credits_awarded) THEN
    PERFORM create_intelligent_notification(
      NEW.user_id,
      'credits_awarded'::notification_type,
      format('You Earned %s Credits! 💰', NEW.credits_awarded),
      format('Congratulations! You earned %s credits for your submission "%s".', 
             NEW.credits_awarded, NEW.title),
      'medium',
      '/dashboard/submissions',
      'View Submissions',
      jsonb_build_object(
        'submission_id', NEW.id,
        'credits_awarded', NEW.credits_awarded
      ),
      NULL,
      true,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_credits_awarded
  AFTER UPDATE OF credits_awarded ON assignment_submissions
  FOR EACH ROW
  WHEN (OLD.credits_awarded IS DISTINCT FROM NEW.credits_awarded AND NEW.credits_awarded > 0)
  EXECUTE FUNCTION notify_credits_awarded();

-- Trigger: Group Invitation (when user is added to group)
CREATE OR REPLACE FUNCTION notify_group_invitation()
RETURNS TRIGGER AS $$
DECLARE
  v_group_name TEXT;
BEGIN
  SELECT name INTO v_group_name
  FROM assignment_groups
  WHERE id = NEW.group_id;
  
  PERFORM create_intelligent_notification(
    NEW.user_id,
    'group_invitation'::notification_type,
    format('Invited to Group: %s', v_group_name),
    format('You have been added to the group "%s". Start collaborating on assignments!', v_group_name),
    'medium',
    format('/dashboard/groups/%s', NEW.group_id),
    'View Group',
    jsonb_build_object(
      'group_id', NEW.group_id,
      'group_name', v_group_name,
      'role', NEW.role
    ),
    format('group_%s', NEW.group_id),
    true,
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_group_invitation
  AFTER INSERT ON assignment_group_members
  FOR EACH ROW
  EXECUTE FUNCTION notify_group_invitation();

-- Function to check and notify low credit balance
CREATE OR REPLACE FUNCTION check_and_notify_low_credits()
RETURNS void AS $$
DECLARE
  v_user_record RECORD;
  v_notification_id UUID;
  v_existing_notification UUID;
BEGIN
  -- Find users with low credits who haven't been notified recently
  FOR v_user_record IN
    SELECT 
      uc.user_id,
      uc.balance
    FROM user_credits uc
    WHERE uc.balance <= 20
      AND uc.balance > 0
      AND NOT EXISTS (
        SELECT 1 
        FROM notifications n
        WHERE n.user_id = uc.user_id
          AND n.type IN ('credit_balance_low', 'credit_balance_critical')
          AND n.is_read = false
          AND n.created_at > NOW() - INTERVAL '24 hours'
      )
  LOOP
    -- Determine notification type and priority
    IF v_user_record.balance <= 5 THEN
      -- Critical
      PERFORM create_intelligent_notification(
        v_user_record.user_id,
        'credit_balance_critical'::notification_type,
        'Critical: Low Credit Balance! ⚠️',
        format('Your credit balance is very low (%s credits). Purchase more credits to continue using our services.', 
               v_user_record.balance),
        'urgent',
        '/dashboard/purchase',
        'Purchase Credits',
        jsonb_build_object('balance', v_user_record.balance),
        'credit_balance',
        true,
        NULL
      );
    ELSIF v_user_record.balance <= 20 THEN
      -- Low
      PERFORM create_intelligent_notification(
        v_user_record.user_id,
        'credit_balance_low'::notification_type,
        'Low Credit Balance Reminder',
        format('Your credit balance is running low (%s credits). Consider purchasing more credits.', 
               v_user_record.balance),
        'medium',
        '/dashboard/purchase',
        'Purchase Credits',
        jsonb_build_object('balance', v_user_record.balance),
        'credit_balance',
        true,
        NULL
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialize default notification preferences for existing users
CREATE OR REPLACE FUNCTION initialize_notification_preferences()
RETURNS void AS $$
DECLARE
  v_user_record RECORD;
  v_type notification_type;
BEGIN
  -- For each user, create default preferences for all notification types
  FOR v_user_record IN SELECT id FROM auth.users LOOP
    FOR v_type IN SELECT unnest(enum_range(NULL::notification_type)) LOOP
      INSERT INTO notification_preferences (user_id, notification_type, enabled, allow_aggregation, min_priority)
      VALUES (v_user_record.id, v_type, true, true, 'low')
      ON CONFLICT (user_id, notification_type) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE notifications IS 'Intelligent notification system with aggregation, priority, and smart timing';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification types and delivery methods';
COMMENT ON TABLE notification_read_receipts IS 'Tracks when users read notifications and take actions';
COMMENT ON FUNCTION create_intelligent_notification IS 'Creates notifications with intelligent aggregation and preference checking';
COMMENT ON FUNCTION mark_notification_read IS 'Marks a notification as read and creates a read receipt';
COMMENT ON FUNCTION get_unread_notification_count IS 'Returns the count of unread notifications for a user';

