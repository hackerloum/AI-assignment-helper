-- Add LGTI Individual Assignment Template to database
-- This provides fallback support if DOCX template is not found

INSERT INTO public.assignment_templates (
  college_name,
  college_code,
  template_type,
  cover_page_format,
  content_format,
  is_active
) VALUES (
  'Local Government Training Institute',
  'LGTI',
  'individual',
  '{
    "logo_position": "center",
    "institution_name": "THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)",
    "institution_name_size": 16,
    "institution_name_bold": true,
    "institution_name_uppercase": true,
    "fields": [
      {"label": "LOGO OF COLLEGE", "type": "logo", "align": "center"},
      {"label": "COURSE NAME", "value": "placeholder", "align": "left"},
      {"label": "MODULE CODE", "value": "placeholder", "align": "left"},
      {"label": "MODULE NAME", "value": "placeholder", "align": "left"},
      {"label": "LECTURE NAME", "value": "placeholder", "align": "left"},
      {"label": "TYPE OF WORK", "value": "placeholder", "align": "left"},
      {"label": "REGISTRATION NUMBER", "value": "placeholder", "align": "left"},
      {"label": "NAME OF STUDENT", "value": "placeholder", "align": "left"},
      {"label": "SUBMISSION DATE", "value": "placeholder", "align": "left"},
      {"label": "QUESTION", "value": "placeholder", "align": "left", "bold": true}
    ]
  }'::jsonb,
  '{
    "font": "Times New Roman",
    "font_size": 12,
    "line_spacing": 1.5,
    "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1},
    "heading_style": {"font_size": 14, "bold": true},
    "paragraph_indent": 0.5,
    "border": true
  }'::jsonb,
  true
)
ON CONFLICT (college_code, template_type) 
DO UPDATE SET
  college_name = EXCLUDED.college_name,
  cover_page_format = EXCLUDED.cover_page_format,
  content_format = EXCLUDED.content_format,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Add comment
COMMENT ON TABLE public.assignment_templates IS 'Assignment templates for Tanzanian universities. DOCX templates take precedence over database entries.';

