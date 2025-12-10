# DOCX Template System Guide

## Overview

The Assignment Writer tool now supports real DOCX templates using `docxtemplater`. Instead of storing template metadata in Supabase, templates are actual Word documents that get filled with student data.

## How It Works

1. **Template Storage**: DOCX template files are stored in the `templates/` directory
2. **Template Selection**: Students select templates from the template selector
3. **Data Filling**: When generating assignments, the system fills template variables with student-provided data
4. **Export**: The filled template is exported as a completed assignment

## Template Naming Convention

Templates must follow this naming pattern:
```
{COLLEGE_CODE}_{TYPE}.docx
```

Examples:
- `LGTI_group.docx` - LGTI group assignment template
- `LGTI_individual.docx` - LGTI individual assignment template
- `UDSM_group.docx` - UDSM group assignment template

## Template Variables

Use these variables in your DOCX templates (docxtemplater syntax):

### Basic Information
- `{college_name}` - College/University name
- `{college_code}` - College code (e.g., LGTI, UDSM)
- `{program_name}` - Program name
- `{module_name}` - Module name
- `{module_code}` - Module code
- `{course_name}` - Course name
- `{course_code}` - Course code
- `{instructor_name}` - Instructor's name
- `{type_of_work}` - Type of work (e.g., "Group Assignment")
- `{group_number}` - Group number
- `{submission_date}` - Submission date
- `{task}` - Assignment task/description
- `{student_name}` - Student name (individual assignments)
- `{registration_number}` - Registration number
- `{group_name}` - Group name
- `{title}` - Assignment title

### Content
- `{assignment_content}` - Main assignment content (formatted paragraphs)

### References
- `{references}` - Formatted references list

### Group Members (Loops)
For LGTI format with group participants table:
```
{#group_members}
{sn} | {name} | {registration_no} | {phone_number}
{/group_members}
```

### Group Representatives
```
{#group_representatives}
{name} | {role} | {registration_no}
{/group_representatives}
```

### Conditional Logic
```
{#is_group}
This is a group assignment
{/is_group}

{#is_individual}
This is an individual assignment
{/is_individual}
```

## Creating a Template

### Step 1: Create the Word Document
1. Open Microsoft Word
2. Create your template with the desired formatting
3. Use `{variable_name}` syntax for placeholders
4. For tables, use loops as shown above

### Step 2: Save the Template
1. Save as `.docx` format
2. Name it: `{COLLEGE_CODE}_{TYPE}.docx`
3. Place it in the `templates/` directory

### Step 3: Test the Template
1. Go to Assignment Writer → New Assignment
2. Select the template from the template selector
3. Preview the template
4. Fill in the form and generate
5. Export and verify all variables are filled correctly

## Example: LGTI Group Template

```
THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)
LOGO OF COLLEGE

PROGRAM NAME: {program_name}
MODULE NAME: {module_name}
MODULE CODE: {module_code}
INSTRUCTOR'S NAME: {instructor_name}
TYPE OF WORK: {type_of_work}
GROUP NUMBER: {group_number}
SUBMISSION DATE: {submission_date}

GROUP PARTICIPANTS
S/N | NAME OF PARTICIPANTS | REGISTRATION NUMBER | PHONE NUMBER
{#group_members}
{sn} | {name} | {registration_no} | {phone_number}
{/group_members}

Task
{task}

{assignment_content}

REFERENCES
{references}
```

## API Endpoints

### List Templates
```
GET /api/assignment/templates/list
```
Returns list of available DOCX templates.

### Preview Template
```
GET /api/assignment/templates/preview?code=LGTI&type=group
```
Downloads the template file for preview.

### Export Assignment
```
POST /api/assignment/export
{
  "assignmentId": "uuid"
}
```
Generates the completed assignment using the template if `template_code` and `template_type` are set.

## Database Schema

The `assignments_new` table now includes:
- `template_code` (TEXT) - College code for DOCX template
- `template_type` (TEXT) - 'individual' or 'group'

These are set automatically when a DOCX template is selected.

## Fallback Behavior

- If a DOCX template is not found, the system falls back to programmatic generation
- If `template_code` and `template_type` are not set, programmatic generation is used
- Legacy Supabase templates still work via `template_id`

## Troubleshooting

### Template Not Found
- Check the template file exists in `templates/` directory
- Verify the naming convention: `{CODE}_{TYPE}.docx`
- Check file permissions

### Variables Not Filling
- Ensure variable names match exactly (case-sensitive)
- Check for typos in variable names
- Verify the data is being passed correctly

### Template Rendering Errors
- Check docxtemplater syntax is correct
- Ensure loops are properly closed
- Verify conditional blocks are valid

## Migration

To migrate from Supabase templates to DOCX templates:

1. Export existing template data from Supabase
2. Create DOCX files matching the format
3. Place them in `templates/` directory
4. Update template selector to use new system
5. Test thoroughly before removing Supabase templates

## Best Practices

1. **Keep Templates Simple**: Use standard Word formatting
2. **Test Thoroughly**: Test with various data combinations
3. **Version Control**: Keep templates in version control
4. **Documentation**: Document custom variables in template comments
5. **Backup**: Keep backups of template files

## Support

For issues or questions:
1. Check template syntax in `templates/README.md`
2. Verify variable names match the data structure
3. Test with minimal data first
4. Check console logs for errors

