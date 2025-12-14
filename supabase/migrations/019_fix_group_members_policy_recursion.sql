-- Fix infinite recursion in assignment_group_members policy
-- The original policy was querying the same table it was protecting, causing recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view group members" ON assignment_group_members;
DROP POLICY IF EXISTS "Group leaders can add members" ON assignment_group_members;

-- Drop the function if it exists (we'll use a simpler approach)
DROP FUNCTION IF EXISTS is_group_member(UUID, UUID);

-- Create a simpler SELECT policy that doesn't cause recursion
-- Users can see members of groups they created
CREATE POLICY "Users can view group members"
ON assignment_group_members FOR SELECT
TO authenticated
USING (
  -- User can see members if they created the group
  EXISTS (
    SELECT 1 
    FROM assignment_groups ag
    WHERE ag.id = assignment_group_members.group_id
    AND ag.created_by = auth.uid()
  )
  -- Or if the user_id matches (user can see their own membership)
  OR assignment_group_members.user_id = auth.uid()
);

-- Create a simpler INSERT policy
-- Users can add themselves to groups, or group creators can add anyone
CREATE POLICY "Group leaders can add members"
ON assignment_group_members FOR INSERT
TO authenticated
WITH CHECK (
  -- User can add themselves to any group
  assignment_group_members.user_id = auth.uid()
  -- Or user created the group
  OR EXISTS (
    SELECT 1
    FROM assignment_groups ag
    WHERE ag.id = assignment_group_members.group_id
    AND ag.created_by = auth.uid()
  )
);

