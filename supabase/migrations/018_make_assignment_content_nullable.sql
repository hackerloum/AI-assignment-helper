-- Make assignment_content nullable to support file-only submissions
-- This allows submissions with only file uploads (no text content)
ALTER TABLE assignment_submissions 
ALTER COLUMN assignment_content DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN assignment_submissions.assignment_content IS 'Assignment content text. Can be NULL if submission only contains file uploads.';

