-- Add INSERT policy for user_credits table
-- This allows users to create their own credit record when they first log in

CREATE POLICY IF NOT EXISTS "Users can insert own credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

