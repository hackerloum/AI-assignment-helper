-- Fix recursion in assignment_submissions policy that queries assignment_group_members
-- The "Users can view group submissions" policy was causing recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view group submissions" ON assignment_submissions;

-- Create a simpler policy that doesn't cause recursion
-- For group submissions, users can see them if they created the group OR if it's their own submission
CREATE POLICY "Users can view group submissions"
ON assignment_submissions FOR SELECT
TO authenticated
USING (
  -- User can always see their own submissions (handled by other policy, but included for clarity)
  auth.uid() = user_id
  -- OR if it's a group submission and user created the group (checks assignment_groups, not assignment_group_members)
  OR (
    submission_type = 'group' AND
    EXISTS (
      SELECT 1 
      FROM assignment_groups ag
      WHERE ag.id = assignment_submissions.group_id
      AND ag.created_by = auth.uid()
    )
  )
);

