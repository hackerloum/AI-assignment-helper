-- Add college_name field to assignment_submissions table
ALTER TABLE assignment_submissions 
ADD COLUMN IF NOT EXISTS college_name TEXT;

-- Create index for college name filtering
CREATE INDEX IF NOT EXISTS idx_submissions_college_name ON assignment_submissions(college_name);

-- Make assignment_content nullable when file is uploaded
-- Note: We'll handle validation in application code to ensure either content or file_urls is provided

-- Add comment
COMMENT ON COLUMN assignment_submissions.college_name IS 'College/University name for filtering and categorization';






