# Assignment Templates Directory

This directory contains DOCX template files for different colleges and assignment types.

## Template Naming Convention

Templates should be named using the following format:
```
{COLLEGE_CODE}_{TYPE}.docx
```

Examples:
- `LGTI_group.docx` - LGTI group assignment template
- `LGTI_individual.docx` - LGTI individual assignment template
- `UDSM_group.docx` - UDSM group assignment template
- `UDSM_individual.docx` - UDSM individual assignment template

## Template Variables

Templates use docxtemplater syntax. Use the following variables in your DOCX templates:

### Basic Fields
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
- `{student_name}` - Student name (for individual assignments)
- `{registration_number}` - Registration number
- `{group_name}` - Group name
- `{title}` - Assignment title

### Content
- `{assignment_content}` - Main assignment content (formatted with paragraphs)

### References
- `{references}` - Formatted references list

### Group Members (for LGTI format)
Use loops for group members:
```
{#group_members}
S/N: {sn}
Name: {name}
Registration: {registration_no}
Phone: {phone_number}
{/group_members}
```

### Group Representatives
```
{#group_representatives}
Name: {name}
Role: {role}
Registration: {registration_no}
{/group_representatives}
```

### Conditional Logic
You can use conditional blocks:
```
{#is_group}
This is a group assignment
{/is_group}

{#is_individual}
This is an individual assignment
{/is_individual}
```

## Creating Templates

1. Create a Word document with your desired format
2. Use `{variable_name}` syntax for placeholders
3. Save as `.docx` format
4. Name it according to the convention: `{COLLEGE_CODE}_{TYPE}.docx`
5. Place it in this `templates/` directory

## Example Template Structure

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

## Testing Templates

After creating a template, test it by:
1. Using the template selector in the assignment tool
2. Previewing the template
3. Generating a test assignment
4. Verifying all variables are filled correctly

## Notes

- Templates are loaded from this directory at runtime
- If a template is not found, the system falls back to programmatic generation
- Template files should be valid DOCX files
- Keep templates simple and use standard Word formatting

