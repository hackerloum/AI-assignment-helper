# LGTI Individual Assignment Template - Variable Guide

Based on your template image, here are the **exact variables** to use in your `LGTI_individual.docx` template:

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
COURSE NAME: {course_name}
MODULE CODE: {module_code}
MODULE NAME: {module_name}
LECTURE NAME: {instructor_name}
TYPE OF WORK: {type_of_work}
REGISTRATION NUMBER: {registration_number}
NAME OF STUDENT: {student_name}
SUBMISSION DATE: {submission_date}
```

### 3. Question Section
```
QUESTION
{task}
```

### 4. Assignment Content (Optional - for main content)
```
{assignment_content}
```

### 5. References Section (Optional - for citations)
```
REFERENCES
{references}
```

## Complete Template Example

Here's how your complete template should look in Word:

```
THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)
[Insert Logo Here]

COURSE NAME: {course_name}
MODULE CODE: {module_code}
MODULE NAME: {module_name}
LECTURE NAME: {instructor_name}
TYPE OF WORK: {type_of_work}
REGISTRATION NUMBER: {registration_number}
NAME OF STUDENT: {student_name}
SUBMISSION DATE: {submission_date}

QUESTION
{task}

{assignment_content}

REFERENCES
{references}
```

## Variable Names (Case-Sensitive)

- `{course_name}` - Course name
- `{module_code}` - Module code
- `{module_name}` - Module name
- `{instructor_name}` - Instructor/Lecture name
- `{type_of_work}` - Type of work (e.g., "INDIVIDUAL ASSIGNMENT")
- `{registration_number}` - Student registration number
- `{student_name}` - Student's full name
- `{submission_date}` - Submission date
- `{task}` - Assignment question/task description
- `{assignment_content}` - Main assignment content (formatted with paragraphs)
- `{references}` - Formatted references list

## Static Text

Keep these as static text (not variables):
- "THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)"
- "LOGO OF COLLEGE" (or replace with actual logo)
- "COURSE NAME:", "MODULE CODE:", "MODULE NAME:", "LECTURE NAME:", "TYPE OF WORK:", "REGISTRATION NUMBER:", "NAME OF STUDENT:", "SUBMISSION DATE:" (field labels)
- "QUESTION" (section heading)
- "REFERENCES" (section heading, if included)

## Creating the Template in Word

1. **Create the Header:**
   - Type: "THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)"
   - Center align
   - Add "LOGO OF COLLEGE" below (or insert actual logo image)
   - Add a border around the page if desired

2. **Add Information Fields:**
   - Type each label followed by the variable:
   - Example: `COURSE NAME: {course_name}`
   - Press Enter after each field
   - Format labels in bold if desired

3. **Add Question Section:**
   - Type "QUESTION" as heading (in bold)
   - Below it, type: `{task}`

4. **Add Content Section (Optional):**
   - After the question, the assignment content will automatically be inserted using `{assignment_content}`

5. **Add References Section (Optional):**
   - Type "REFERENCES" as heading
   - Below it, type: `{references}`

6. **Formatting:**
   - Add borders as needed (the template shows a thick black border)
   - Use appropriate fonts and sizes
   - Ensure proper spacing
   - Center align the header and logo

## Key Differences from Group Template

- **No Group Members Table** - Individual assignments don't need participant tables
- **Student Name** - Uses `{student_name}` instead of group members
- **Registration Number** - Single `{registration_number}` instead of multiple
- **Course Name** - Uses `{course_name}` instead of `{program_name}`
- **Lecture Name** - Uses `{instructor_name}` (same variable, different label)
- **No Group Number** - Individual assignments don't have group numbers

## Testing

After creating the template:

1. Save as `LGTI_individual.docx` in the `templates/` folder
2. Test by creating an individual assignment
3. Select "LGTI" template from the template selector
4. Fill in the form with sample data:
   - Course Name: e.g., "Public Administration"
   - Module Code: e.g., "PA101"
   - Module Name: e.g., "Introduction to Public Administration"
   - Lecture Name: e.g., "Dr. John Smith"
   - Type of Work: e.g., "INDIVIDUAL ASSIGNMENT"
   - Registration Number: e.g., "LGTI/2024/001"
   - Name of Student: e.g., "Jane Doe"
   - Submission Date: e.g., "15/12/2024"
   - Question: Your assignment question
5. Verify all fields are filled correctly
6. Check that the logo appears correctly
7. Verify the border formatting matches your requirements

## Notes

- The template should have a thick black border around the page (as shown in your image)
- All field labels should be in bold
- The logo should be centered below the institute name
- Make sure the logo image is embedded in the Word document (not linked)
- Use high-resolution logo for best print quality

