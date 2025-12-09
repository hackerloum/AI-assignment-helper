# How to Run Supabase Migrations

This guide shows you how to run the `002_assignment_tool.sql` migration in your Supabase project.

## Method 1: Using Supabase Dashboard (Recommended - Easiest)

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Open SQL Editor
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New query"** button (top right)

### Step 3: Copy and Paste the Migration
1. Open the file: `supabase/migrations/002_assignment_tool.sql`
2. **Copy the ENTIRE file content** (Ctrl+A, then Ctrl+C)
3. Paste it into the SQL Editor in Supabase

### Step 4: Run the Migration
1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for the query to complete
3. You should see a success message: "Success. No rows returned"

### Step 5: Verify the Migration
1. Go to **"Table Editor"** in the left sidebar
2. You should see these new tables:
   - `assignment_templates`
   - `custom_templates`
   - `assignments_new`
3. Check `assignment_templates` - you should see 4 templates:
   - UDSM (individual)
   - UDSM (group)
   - DIT (individual)
   - LGTI (group)

---

## Method 2: Using Supabase CLI (Advanced)

If you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

---

## Troubleshooting

### Error: "relation already exists"
- This means some tables already exist
- The migration uses `CREATE TABLE IF NOT EXISTS`, so this should be safe
- You can ignore this error or drop existing tables first

### Error: "duplicate key value violates unique constraint"
- This means templates were already inserted
- The migration uses `ON CONFLICT DO NOTHING`, so this should be safe
- You can ignore this error

### Error: "permission denied"
- Make sure you're running the query as the database owner
- Check your Supabase project permissions

### Error: "syntax error"
- Check for any copy-paste issues
- Make sure the entire SQL file was copied
- Verify there are no extra characters

---

## Quick Copy-Paste Method

If you just want to run the LGTI template insertion (lines 204-235):

1. Open Supabase SQL Editor
2. Copy and paste this:

```sql
INSERT INTO public.assignment_templates (college_name, college_code, template_type, cover_page_format, content_format) VALUES
(
  'Local Government Training Institute',
  'LGTI',
  'group',
  '{
    "logo_position": "center",
    "institution_name": "THE LOCAL GOVERNMENT TRAINING INSTITUTE (LGTI)",
    "institution_name_size": 16,
    "institution_name_bold": true,
    "institution_name_uppercase": true,
    "fields": [
      {"label": "LOGO OF COLLEGE", "type": "logo", "align": "center"},
      {"label": "PROGRAM NAME", "value": "placeholder", "align": "center"},
      {"label": "MODULE NAME", "value": "placeholder", "align": "center"},
      {"label": "MODULE CODE", "value": "placeholder", "align": "center"},
      {"label": "INSTRUCTOR''S NAME", "value": "placeholder", "align": "left"},
      {"label": "TYPE OF WORK", "value": "GROUP ASSIGNMENT", "align": "left", "bold": true},
      {"label": "GROUP NUMBER", "value": "placeholder", "align": "left"},
      {"label": "SUBMISSION DATE", "value": "placeholder", "align": "left"},
      {"label": "GROUP PARTICIPANTS", "type": "table", "columns": ["S/N", "NAME OF PARTICIPANTS", "REGISTRATION NUMBER", "PHONE NUMBER"]},
      {"label": "Task", "value": "placeholder", "align": "left", "bold": true}
    ]
  }'::jsonb,
  '{
    "font": "Times New Roman",
    "font_size": 12,
    "line_spacing": 1.5,
    "margins": {"top": 1, "bottom": 1, "left": 1, "right": 1},
    "heading_style": {"font_size": 14, "bold": true}
  }'::jsonb
)
ON CONFLICT (college_code, template_type) DO NOTHING;
```

3. Click **"Run"**

---

## Verification Checklist

After running the migration, verify:

- [ ] Tables created: `assignment_templates`, `custom_templates`, `assignments_new`
- [ ] RLS policies enabled on all tables
- [ ] 4 templates in `assignment_templates` table:
  - [ ] UDSM individual
  - [ ] UDSM group
  - [ ] DIT individual
  - [ ] LGTI group
- [ ] Indexes created (check in Table Editor > Indexes)

---

## Need Help?

If you encounter any errors:
1. Copy the exact error message
2. Check which line number it references
3. Verify the SQL syntax around that line
4. Make sure you copied the entire file without modifications

