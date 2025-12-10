# LGTI Group Assignment Template Structure

This document shows the exact structure and variables to use in your `LGTI_group.docx` template file.

## Template Structure

```
THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)
LOGO OF COLLEGE

PROGRAM NAME: {program_name}
MODULE NAME: {module_name}
MODULE CODE: {module_code}
INSTRUCTOR' NAME: {instructor_name}
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
```

## Important Notes for docxtemplater

### 1. Table Structure
When creating the table in Word:
- Create a table with 4 columns: S/N, NAME OF PARTICIPANTS, REGISTRATION NUMBER, PHONE NUMBER
- In the first data row, use the loop syntax:
  ```
  {#group_members}
  {sn} | {name} | {registration_no} | {phone_number}
  {/group_members}
  ```
- Delete the header row from the loop (keep it outside)
- The loop will automatically create rows for each group member

### 2. Variable Names (Case-Sensitive)
- `{program_name}` - Program name
- `{module_name}` - Module name
- `{module_code}` - Module code
- `{instructor_name}` - Instructor's name
- `{type_of_work}` - Type of work (e.g., "GROUP ASSIGNMENT")
- `{group_number}` - Group number
- `{submission_date}` - Submission date
- `{task}` - Assignment task/description

### 3. Group Members Table
The `group_members` array will be automatically populated with:
- `{sn}` - Serial number (1, 2, 3, ...)
- `{name}` - Participant name
- `{registration_no}` - Registration number
- `{phone_number}` - Phone number

### 4. Static Text
Keep these as static text (not variables):
- "THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)"
- "LOGO OF COLLEGE" (or replace with actual logo)
- "GROUP PARTICIPANTS"
- "S/N", "NAME OF PARTICIPANTS", "REGISTRATION NUMBER", "PHONE NUMBER" (table headers)
- "Task"

## Creating the Template in Word

1. **Create the Header:**
   - Type: "THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)"
   - Center align
   - Add "LOGO OF COLLEGE" below (or insert actual logo)

2. **Add Information Fields:**
   - Type each label followed by the variable:
   - Example: `PROGRAM NAME: {program_name}`
   - Press Enter after each field

3. **Create the Table:**
   - Insert a table with 4 columns
   - Add header row: S/N | NAME OF PARTICIPANTS | REGISTRATION NUMBER | PHONE NUMBER
   - In the first data row, type:
     ```
     {#group_members}
     {sn} | {name} | {registration_no} | {phone_number}
     {/group_members}
     ```
   - Make sure each variable is in a separate cell

4. **Add Task Section:**
   - Type "Task" as heading
   - Below it, type: `{task}`

5. **Formatting:**
   - Add borders as needed
   - Use appropriate fonts and sizes
   - Ensure proper spacing

## Testing

After creating the template:
1. Save as `LGTI_group.docx` in the `templates/` folder
2. Test by creating a group assignment
3. Verify all fields are filled correctly
4. Check that the table rows are generated properly

