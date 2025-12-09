-- Migration: Add one-time payment tracking
-- This migration adds a field to track if a user has paid the one-time signup fee

-- Add has_paid_one_time_fee column to user_credits table
ALTER TABLE user_credits 
ADD COLUMN IF NOT EXISTS has_paid_one_time_fee BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_credits_payment_status 
ON user_credits(user_id, has_paid_one_time_fee);

-- Add comment
COMMENT ON COLUMN user_credits.has_paid_one_time_fee IS 'Tracks if user has paid the one-time signup fee of 3000 TZS';

-- Update payments table to track payment type
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'subscription' 
CHECK (payment_type IN ('subscription', 'one_time'));

-- Add comment
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: subscription or one_time signup fee';

