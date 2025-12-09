-- Add INSERT policy for user_credits table
-- This allows users to create their own credit record when they first log in

-- Drop policy if it exists (in case of re-running migration)
DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;

-- Create the INSERT policy
CREATE POLICY "Users can insert own credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

