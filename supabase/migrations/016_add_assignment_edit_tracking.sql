-- Add edit tracking and download tracking to prevent credit abuse
-- This migration adds fields to track edits, downloads, and prevent unauthorized sharing

-- Add fields to assignments_new table
ALTER TABLE public.assignments_new
ADD COLUMN IF NOT EXISTS original_content_hash TEXT,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS content_changed_percentage DECIMAL(5,2) DEFAULT 0;

-- Create assignment_edit_history table to track all edits
CREATE TABLE IF NOT EXISTS public.assignment_edit_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments_new(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edit_type TEXT NOT NULL CHECK (edit_type IN ('content', 'cover_page', 'metadata')),
  old_value TEXT,
  new_value TEXT,
  content_change_percentage DECIMAL(5,2),
  credits_charged INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create assignment_downloads table to track all downloads
CREATE TABLE IF NOT EXISTS public.assignment_downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments_new(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_charged INTEGER DEFAULT 0,
  download_type TEXT DEFAULT 'docx',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_edit_history_assignment ON public.assignment_edit_history(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_edit_history_user ON public.assignment_edit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_downloads_assignment ON public.assignment_downloads(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_downloads_user ON public.assignment_downloads(user_id);

-- RLS Policies
ALTER TABLE public.assignment_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_downloads ENABLE ROW LEVEL SECURITY;

-- Users can only view their own edit history
CREATE POLICY "Users can view own edit history" ON public.assignment_edit_history
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only view their own download history
CREATE POLICY "Users can view own download history" ON public.assignment_downloads
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert edit history (via service role)
-- Note: This will be handled by the API with proper authentication

-- Add comments
COMMENT ON COLUMN public.assignments_new.original_content_hash IS 'Hash of original content to detect significant changes';
COMMENT ON COLUMN public.assignments_new.edit_count IS 'Number of times assignment has been edited';
COMMENT ON COLUMN public.assignments_new.download_count IS 'Number of times assignment has been downloaded';
COMMENT ON COLUMN public.assignments_new.content_changed_percentage IS 'Percentage of content changed from original';
COMMENT ON TABLE public.assignment_edit_history IS 'Tracks all edits to assignments to prevent credit abuse';
COMMENT ON TABLE public.assignment_downloads IS 'Tracks all downloads to prevent unauthorized sharing';

