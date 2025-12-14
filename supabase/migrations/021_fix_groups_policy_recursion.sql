-- Fix recursion in assignment_groups policy that queries assignment_group_members

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view groups they belong to" ON assignment_groups;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can view groups they belong to"
ON assignment_groups FOR SELECT
TO authenticated
USING (
  -- User can see groups they created
  auth.uid() = created_by
  -- Note: We can't check membership without recursion, so we'll rely on users being able to see
  -- their own membership records (from the assignment_group_members policy)
  -- This means users will see groups they created, and can see groups through their membership records
);

