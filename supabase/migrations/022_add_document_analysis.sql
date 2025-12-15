-- Document analysis storage for format analysis feature
CREATE TABLE IF NOT EXISTS document_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_file_url TEXT NOT NULL,
  parsed_data JSONB NOT NULL,        -- Step 1 output: parsed document data
  structure_analysis JSONB NOT NULL, -- Step 2 output: AI structure analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add analysis reference to assignments
ALTER TABLE assignments_new 
ADD COLUMN IF NOT EXISTS document_analysis_id UUID REFERENCES document_analyses(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_analyses_user_id ON document_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_analysis_id ON assignments_new(document_analysis_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_created_at ON document_analyses(created_at);

-- RLS Policies for document_analyses
ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own document analyses
CREATE POLICY "Users can view their own document analyses"
  ON document_analyses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own document analyses
CREATE POLICY "Users can insert their own document analyses"
  ON document_analyses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own document analyses
CREATE POLICY "Users can update their own document analyses"
  ON document_analyses
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own document analyses
CREATE POLICY "Users can delete their own document analyses"
  ON document_analyses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE document_analyses IS 'Stores document format analysis data from uploaded assignment documents';
COMMENT ON COLUMN document_analyses.parsed_data IS 'Step 1: Parsed document data (text, headings, styles, images)';
COMMENT ON COLUMN document_analyses.structure_analysis IS 'Step 2: AI structure analysis (cover page, sections, formatting rules)';

