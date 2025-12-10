-- Add LGTI-specific fields to assignments_new table
-- These fields support the LGTI group assignment template format

ALTER TABLE public.assignments_new
ADD COLUMN IF NOT EXISTS program_name TEXT,
ADD COLUMN IF NOT EXISTS module_name TEXT,
ADD COLUMN IF NOT EXISTS module_code TEXT,
ADD COLUMN IF NOT EXISTS type_of_work TEXT,
ADD COLUMN IF NOT EXISTS task TEXT,
ADD COLUMN IF NOT EXISTS group_number TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.assignments_new.program_name IS 'Program name (for LGTI format)';
COMMENT ON COLUMN public.assignments_new.module_name IS 'Module name (for LGTI format)';
COMMENT ON COLUMN public.assignments_new.module_code IS 'Module code (for LGTI format)';
COMMENT ON COLUMN public.assignments_new.type_of_work IS 'Type of work (e.g., GROUP ASSIGNMENT)';
COMMENT ON COLUMN public.assignments_new.task IS 'Assignment task/description';
COMMENT ON COLUMN public.assignments_new.group_number IS 'Group number';

