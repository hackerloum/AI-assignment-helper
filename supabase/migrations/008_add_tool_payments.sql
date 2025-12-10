-- Migration: Add support for tool payments (pay-per-use without account)
-- This allows users to pay for individual tool usage without creating an account

-- Step 1: Update payment_type constraint to include 'tool'
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type IN ('subscription', 'one_time', 'tool'));

-- Step 2: Add metadata column to store tool payment information
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB;

-- Step 3: Make user_id nullable for tool payments (no account required)
-- Note: Foreign key constraint allows NULL values by default in PostgreSQL
-- This is safe because NULL values in foreign keys are allowed
ALTER TABLE payments 
ALTER COLUMN user_id DROP NOT NULL;

-- Step 4: Ensure payment_type has a default value for existing rows
-- Update any NULL payment_type to 'subscription' (backward compatibility)
UPDATE payments 
SET payment_type = 'subscription' 
WHERE payment_type IS NULL;

-- Step 5: Add index for tool payment lookups (improves query performance)
CREATE INDEX IF NOT EXISTS idx_payments_tool_payments 
ON payments(payment_type, payment_status) 
WHERE payment_type = 'tool';

-- Step 6: Note about RLS policies
-- Tool payments are created via admin client (service role key) which bypasses RLS
-- Existing RLS policies remain unchanged - they only apply to regular authenticated users
-- Tool payments (with NULL user_id) are handled server-side via admin client

-- Step 7: Add comments for documentation
COMMENT ON COLUMN payments.metadata IS 'Stores additional payment data like tool paymentId, tool type, buyer info, etc.';
COMMENT ON COLUMN payments.payment_type IS 'Type of payment: subscription (credits), one_time (registration fee), or tool (pay-per-use without account)';
COMMENT ON COLUMN payments.user_id IS 'User ID for account-based payments. NULL for tool payments (no account required).';

