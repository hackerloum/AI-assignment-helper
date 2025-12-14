-- Fix infinite recursion in assignment_group_members policy
-- The original policy was querying the same table it was protecting, causing recursion

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view group members" ON assignment_group_members;
DROP POLICY IF EXISTS "Group leaders can add members" ON assignment_group_members;

-- Create a function to check group membership (avoids recursion)
CREATE OR REPLACE FUNCTION is_group_member(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM assignment_group_members
    WHERE group_id = p_group_id 
    AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new SELECT policy that uses the function (avoids recursion)
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
  -- Or if user is a member of the group (using function to avoid recursion)
  OR is_group_member(assignment_group_members.group_id, auth.uid())
);

-- Create a better INSERT policy that also avoids recursion
CREATE POLICY "Group leaders can add members"
ON assignment_group_members FOR INSERT
TO authenticated
WITH CHECK (
  -- User can add members if they created the group
  EXISTS (
    SELECT 1
    FROM assignment_groups ag
    WHERE ag.id = assignment_group_members.group_id
    AND ag.created_by = auth.uid()
  )
  -- Or if user is a leader of the group (using function)
  OR (
    is_group_member(assignment_group_members.group_id, auth.uid())
    AND EXISTS (
      SELECT 1 
      FROM assignment_group_members agm
      WHERE agm.group_id = assignment_group_members.group_id
      AND agm.user_id = auth.uid()
      AND agm.role = 'leader'
    )
  )
);

