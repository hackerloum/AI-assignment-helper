# LGTI Group Assignment Template - Variable Guide

Based on your template image, here are the **exact variables** to use in your `LGTI_group.docx` template:

## Template Structure with Variables

### 1. Header Section (Static Text)
```
THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)
LOGO OF COLLEGE
```
**Note:** Keep these as static text. The logo can be inserted as an image in Word.

### 2. Assignment Information Fields
Use these variables in your template:

```
PROGRAM NAME: {program_name}
MODULE NAME: {module_name}
MODULE CODE: {module_code}
INSTRUCTOR' NAME: {instructor_name}
TYPE OF WORK: {type_of_work}
GROUP NUMBER: {group_number}
SUBMISSION DATE: {submission_date}
```

### 3. Group Participants Table

**Table Headers (Static Text):**
```
GROUP PARTICIPANTS
S/N | NAME OF PARTICIPANTS | REGISTRATION NUMBER | PHONE NUMBER
```

**Table Row (Use Loop):**
In the first data row of your table, use this syntax:
```
{#group_members}
{sn} | {name} | {registration_no} | {phone_number}
{/group_members}
```

**Important:** 
- Each variable (`{sn}`, `{name}`, `{registration_no}`, `{phone_number}`) should be in a **separate cell** of the table
- The loop will automatically create one row for each group member
- The `{sn}` (serial number) will be automatically numbered (1, 2, 3, etc.)

### 4. Task Section
```
Task
{task}
```

## Complete Template Example

Here's how your complete template should look in Word:

```
THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)
[Insert Logo Here]

PROGRAM NAME: {program_name}
MODULE NAME: {module_name}
MODULE CODE: {module_code}
INSTRUCTOR' NAME: {instructor_name}
TYPE OF WORK: {type_of_work}
GROUP NUMBER: {group_number}
SUBMISSION DATE: {submission_date}

GROUP PARTICIPANTS
┌─────┬──────────────────────┬──────────────────────┬──────────────┐
│ S/N │ NAME OF PARTICIPANTS │ REGISTRATION NUMBER  │ PHONE NUMBER│
├─────┼──────────────────────┼──────────────────────┼──────────────┤
│{#group_members}
│ {sn} │ {name} │ {registration_no} │ {phone_number} │
{/group_members}
└─────┴──────────────────────┴──────────────────────┴──────────────┘

Task
{task}
```

## Step-by-Step Instructions for Creating in Word

### Step 1: Create Header
1. Type: `THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)`
2. Center align it
3. Add logo placeholder or insert actual logo
4. Press Enter twice

### Step 2: Add Information Fields
1. Type each line exactly as shown:
   - `PROGRAM NAME: {program_name}`
   - `MODULE NAME: {module_name}`
   - `MODULE CODE: {module_code}`
   - `INSTRUCTOR' NAME: {instructor_name}`
   - `TYPE OF WORK: {type_of_work}`
   - `GROUP NUMBER: {group_number}`
   - `SUBMISSION DATE: {submission_date}`
2. Press Enter after each line

### Step 3: Create the Table
1. Type: `GROUP PARTICIPANTS` (as a heading)
2. Press Enter
3. Insert a Table (4 columns, 2 rows minimum)
4. In the **header row**, type:
   - Column 1: `S/N`
   - Column 2: `NAME OF PARTICIPANTS`
   - Column 3: `REGISTRATION NUMBER`
   - Column 4: `PHONE NUMBER`
5. In the **first data row**, type in each cell:
   - Cell 1: `{#group_members}`
   - Cell 2: `{name}`
   - Cell 3: `{registration_no}`
   - Cell 4: `{phone_number}`
6. After the last cell, press Enter and type: `{/group_members}`
7. Format the table with borders as needed

### Step 4: Add Task Section
1. Type: `Task` (as heading)
2. Press Enter
3. Type: `{task}`

### Step 5: Formatting
1. Add borders around the entire document (as shown in your image)
2. Adjust spacing and alignment
3. Format fonts and sizes as needed

## Variable Reference

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `{program_name}` | Program name | "BASIC TECHNICIAN CERTIFICATE IN COMMUNITY DEVELOPMENT (BTCCD)" |
| `{module_name}` | Module name | "BASICS OF ENTREPRENEURSHIP" |
| `{module_code}` | Module code | "CDT 04211" |
| `{instructor_name}` | Instructor's name | "MR. OBEID" |
| `{type_of_work}` | Type of work | "GROUP ASSIGNMENT" |
| `{group_number}` | Group number | "18" |
| `{submission_date}` | Submission date | "2024-12-15" |
| `{task}` | Assignment task | "Discuss seven (7) Entrepreneurs Myths." |
| `{sn}` | Serial number (auto-generated) | 1, 2, 3, ... |
| `{name}` | Participant name | "JESCA Z KABUJE" |
| `{registration_no}` | Registration number | "NS3830/0029/2021" |
| `{phone_number}` | Phone number | "0712308504" |

## Important Notes

1. **Case Sensitivity:** Variable names are case-sensitive. Use exactly as shown: `{program_name}` not `{Program_Name}`

2. **Table Loop:** The `{#group_members}...{/group_members}` loop will automatically:
   - Create one row for each group member
   - Number them sequentially (1, 2, 3, etc.)
   - Fill in their details

3. **Empty Fields:** If a field is empty, it will show as blank (not show the variable name)

4. **Date Format:** The `{submission_date}` will be formatted as provided in the data

5. **Task Content:** The `{task}` variable contains the assignment task/description

## Testing Your Template

After creating the template:

1. Save it as `LGTI_group.docx` in the `templates/` folder
2. Create a test assignment with sample data
3. Export and verify:
   - All fields are filled correctly
   - Table rows are generated for each group member
   - Serial numbers are correct (1, 2, 3...)
   - Formatting matches your design

## Troubleshooting

**Problem:** Variables not filling
- **Solution:** Check spelling and case of variable names

**Problem:** Table not generating rows
- **Solution:** Ensure `{#group_members}` is in the first cell and `{/group_members}` is after the last cell

**Problem:** Serial numbers not showing
- **Solution:** Make sure `{sn}` is in the first column of the data row

**Problem:** Template not found
- **Solution:** Ensure file is named exactly `LGTI_group.docx` and is in the `templates/` folder

