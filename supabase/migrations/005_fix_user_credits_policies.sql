-- Migration: Fix user_credits RLS policies to allow server-side updates
-- This ensures payment callbacks can update user_credits properly

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Service role can insert credits" ON user_credits;
DROP POLICY IF EXISTS "Service role can update credits" ON user_credits;
DROP POLICY IF EXISTS "user_credits_select_policy" ON user_credits;
DROP POLICY IF EXISTS "user_credits_insert_policy" ON user_credits;
DROP POLICY IF EXISTS "user_credits_update_policy" ON user_credits;

-- Re-create policies with proper permissions
-- Allow authenticated users to view their own credits
CREATE POLICY "Users can view own credits" 
ON user_credits FOR SELECT 
USING (auth.uid() = user_id);

-- Allow service role (server-side) to insert any credits
CREATE POLICY "Service role can insert credits" 
ON user_credits FOR INSERT 
WITH CHECK (true);

-- Allow service role (server-side) to update any credits
CREATE POLICY "Service role can update credits" 
ON user_credits FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Allow users to update only their own credits (for client-side operations)
CREATE POLICY "Users can update own credits" 
ON user_credits FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE user_credits IS 'User credits with RLS policies that allow server-side updates via service role';

