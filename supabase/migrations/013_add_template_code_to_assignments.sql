-- Add template_code and template_type columns for DOCX template support
-- These columns store the college code and template type for DOCX templates

ALTER TABLE public.assignments_new
ADD COLUMN IF NOT EXISTS template_code TEXT,
ADD COLUMN IF NOT EXISTS template_type TEXT CHECK (template_type IN ('individual', 'group'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assignments_new_template_code ON public.assignments_new(template_code);
CREATE INDEX IF NOT EXISTS idx_assignments_new_template_type ON public.assignments_new(template_type);

-- Add comment
COMMENT ON COLUMN public.assignments_new.template_code IS 'College code for DOCX template (e.g., LGTI, UDSM)';
COMMENT ON COLUMN public.assignments_new.template_type IS 'Template type for DOCX template (individual or group)';

