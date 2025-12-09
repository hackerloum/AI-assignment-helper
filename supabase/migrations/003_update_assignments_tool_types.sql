-- Update assignments table to support all AI tool types
-- This fixes the issue where some tools (powerpoint, plagiarism, research, rewrite) 
-- were failing to save usage history due to restrictive CHECK constraint

-- Drop the old constraint
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_tool_type_check;

-- Add new constraint with all supported tool types
ALTER TABLE assignments ADD CONSTRAINT assignments_tool_type_check 
  CHECK (tool_type IN (
    'essay', 
    'paraphrase', 
    'grammar', 
    'citation', 
    'summarizer',
    'powerpoint',
    'plagiarism',
    'research',
    'rewrite'
  ));

-- Add comment to clarify this table stores usage history
COMMENT ON TABLE assignments IS 'Stores AI tool usage history for all user interactions';

