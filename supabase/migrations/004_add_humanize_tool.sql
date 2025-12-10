-- Add humanize tool type to assignments table
ALTER TABLE assignments DROP CONSTRAINT IF EXISTS assignments_tool_type_check;

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
    'rewrite',
    'humanize'
  ));

-- Create humanize_feedback table for training data
CREATE TABLE IF NOT EXISTS humanize_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
  original_text TEXT NOT NULL,
  humanized_text TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  improvement_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_humanize_feedback_user_id ON humanize_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_humanize_feedback_rating ON humanize_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_humanize_feedback_created_at ON humanize_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_humanize_feedback_assignment_id ON humanize_feedback(assignment_id);

-- Enable RLS
ALTER TABLE humanize_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own feedback
CREATE POLICY "Users can view own humanize feedback"
  ON humanize_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own humanize feedback"
  ON humanize_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own humanize feedback"
  ON humanize_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_humanize_feedback_updated_at
  BEFORE UPDATE ON humanize_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE humanize_feedback IS 'Stores user feedback for humanize tool to improve AI training and precision';

