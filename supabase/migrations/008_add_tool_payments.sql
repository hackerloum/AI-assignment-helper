-- Migration: Add support for tool payments (pay-per-use without account)
-- This allows users to pay for individual tool usage without creating an account

-- Update payment_type to include 'tool'
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type IN ('subscription', 'one_time', 'tool'));

-- Add metadata column to store tool payment information
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- Make user_id nullable for tool payments (no account required)
ALTER TABLE payments 
ALTER COLUMN user_id DROP NOT NULL;

-- Add index for tool payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_tool_payments 
ON payments(payment_type, payment_status) 
WHERE payment_type = 'tool';

-- Add comment
COMMENT ON COLUMN payments.metadata IS 'Stores additional payment data like tool paymentId, tool type, etc.';
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: subscription, one_time, or tool';

