-- Assignment Writer Tool - Database Schema
-- This migration creates tables for assignment templates, custom templates, and generated assignments

-- Assignment templates table (pre-built templates for Tanzanian universities)
CREATE TABLE IF NOT EXISTS public.assignment_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  college_name TEXT NOT NULL,
  college_code TEXT UNIQUE NOT NULL, -- e.g., 'UDSM', 'DIT', 'MUCE'
  template_type TEXT NOT NULL CHECK (template_type IN ('individual', 'group')),
  cover_page_format JSONB NOT NULL, -- Structure for cover page
  content_format JSONB NOT NULL, -- Formatting rules
  citation_style TEXT DEFAULT 'APA',
  is_active BOOLEAN DEFAULT TRUE,
  preview_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User custom templates (from sample uploads)
CREATE TABLE IF NOT EXISTS public.custom_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  college_name TEXT,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('individual', 'group')),
  extracted_format JSONB NOT NULL, -- AI-extracted format rules
  sample_file_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated assignments table
CREATE TABLE IF NOT EXISTS public.assignments_new (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('individual', 'group')),
  title TEXT NOT NULL,
  course_code TEXT,
  course_name TEXT,
  instructor_name TEXT,
  submission_date DATE,
  
  -- Group assignment specific
  group_name TEXT,
  group_representatives JSONB, -- Array of {name, role, registration_no}
  group_members JSONB, -- Array of {name, registration_no}
  
  -- Individual assignment specific
  student_name TEXT,
  registration_number TEXT,
  
  -- Content
  assignment_content TEXT,
  references JSONB,
  word_count INTEGER,
  
  -- Template used
  template_id UUID REFERENCES public.assignment_templates(id),
  custom_template_id UUID REFERENCES public.custom_templates(id),
  
  -- Generation metadata
  ai_model_used TEXT,
  generation_time_seconds INTEGER,
  
  -- File
  generated_file_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assignment_templates_college ON public.assignment_templates(college_code);
CREATE INDEX IF NOT EXISTS idx_assignment_templates_type ON public.assignment_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_custom_templates_user ON public.custom_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_new_user ON public.assignments_new(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_new_type ON public.assignments_new(assignment_type);

-- RLS Policies
ALTER TABLE public.assignment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments_new ENABLE ROW LEVEL SECURITY;

-- Templates are viewable by everyone
CREATE POLICY "Templates are viewable by everyone" ON public.assignment_templates
  FOR SELECT USING (is_active = TRUE);

-- Custom templates policies
CREATE POLICY "Users can view own custom templates" ON public.custom_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create custom templates" ON public.custom_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom templates" ON public.custom_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom templates" ON public.custom_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Assignments policies
CREATE POLICY "Users can view own assignments" ON public.assignments_new
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create assignments" ON public.assignments_new
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assignments" ON public.assignments_new
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assignments" ON public.assignments_new
  FOR DELETE USING (auth.uid() = user_id);

-- Seed data for Tanzanian universities
INSERT INTO public.assignment_templates (college_name, college_code, template_type, cover_page_format, content_format) VALUES
(
  'University of Dar es Salaam',
  'UDSM',
  'individual',
  '{
    "logo_position": "center",
    "institution_name_size": 16,
    "institution_name_bold": true,
    "fields": [
      {"label": "COLLEGE/SCHOOL", "value": "placeholder", "align": "center"},
      {"label": "DEPARTMENT", "value": "placeholder", "align": "center"},
      {"label": "COURSE CODE", "value": "placeholder", "align": "center"},
      {"label": "COURSE NAME", "value": "placeholder", "align": "center"},
      {"label": "ASSIGNMENT TITLE", "value": "placeholder", "align": "center", "bold": true},
      {"label": "NAME", "value": "placeholder", "align": "left"},
      {"label": "REGISTRATION NUMBER", "value": "placeholder", "align": "left"},
      {"label": "INSTRUCTOR", "value": "placeholder", "align": "left"},
      {"label": "SUBMISSION DATE", "value": "placeholder", "align": "left"}
    ]
  }'::jsonb,
  '{
    "font": "Times New Roman",
    "font_size": 12,
    "line_spacing": 1.5,
    "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1},
    "heading_style": {"font_size": 14, "bold": true},
    "paragraph_indent": 0.5
  }'::jsonb
),
(
  'University of Dar es Salaam',
  'UDSM',
  'group',
  '{
    "logo_position": "center",
    "institution_name_size": 16,
    "fields": [
      {"label": "COLLEGE/SCHOOL", "value": "placeholder", "align": "center"},
      {"label": "DEPARTMENT", "value": "placeholder", "align": "center"},
      {"label": "COURSE CODE", "value": "placeholder", "align": "center"},
      {"label": "COURSE NAME", "value": "placeholder", "align": "center"},
      {"label": "ASSIGNMENT TITLE", "value": "placeholder", "align": "center", "bold": true},
      {"label": "GROUP NAME", "value": "placeholder", "align": "center", "bold": true},
      {"label": "GROUP REPRESENTATIVES", "type": "table", "columns": ["NAME", "ROLE", "REG. NUMBER"]},
      {"label": "GROUP MEMBERS", "type": "list"},
      {"label": "INSTRUCTOR", "value": "placeholder", "align": "left"},
      {"label": "SUBMISSION DATE", "value": "placeholder", "align": "left"}
    ]
  }'::jsonb,
  '{
    "font": "Times New Roman",
    "font_size": 12,
    "line_spacing": 1.5,
    "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1}
  }'::jsonb
),
(
  'Dar es Salaam Institute of Technology',
  'DIT',
  'individual',
  '{
    "logo_position": "center",
    "institution_name_size": 18,
    "institution_name_bold": true,
    "fields": [
      {"label": "FACULTY", "value": "placeholder", "align": "center"},
      {"label": "DEPARTMENT", "value": "placeholder", "align": "center"},
      {"label": "PROGRAMME", "value": "placeholder", "align": "center"},
      {"label": "COURSE TITLE", "value": "placeholder", "align": "center"},
      {"label": "COURSE CODE", "value": "placeholder", "align": "center"},
      {"label": "ASSIGNMENT TITLE", "value": "placeholder", "align": "center", "bold": true, "underline": true},
      {"label": "SUBMITTED BY", "value": "placeholder", "align": "left"},
      {"label": "REGISTRATION NO", "value": "placeholder", "align": "left"},
      {"label": "SUBMITTED TO", "value": "placeholder", "align": "left"},
      {"label": "DATE OF SUBMISSION", "value": "placeholder", "align": "left"}
    ]
  }'::jsonb,
  '{
    "font": "Arial",
    "font_size": 12,
    "line_spacing": 1.5,
    "margins": {"top": 1, "bottom": 1, "left": 1.25, "right": 1.25}
  }'::jsonb
);

