# Tool Payment Setup Guide

## Database Migration Required

Before tool payments can work, you need to run the database migration to support tool payments without user accounts.

### Step 1: Run the Migration

1. Go to your Supabase Dashboard: https://supabase.com
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Open the file: `supabase/migrations/008_add_tool_payments.sql`
6. **Copy the entire content** and paste it into the SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)
8. You should see: "Success. No rows returned"

### Step 2: Verify Migration

Run this query in SQL Editor to verify:

```sql
-- Check if payment_type includes 'tool'
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%payment_type%';

-- Check if user_id allows NULL
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' AND column_name = 'user_id';

-- Check if metadata column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' AND column_name = 'metadata';
```

### Step 3: Test Tool Payment

After running the migration, try making a tool payment again. It should work!

## What the Migration Does

1. **Makes `user_id` nullable** - Allows tool payments without user accounts
2. **Adds 'tool' to payment_type** - Enables tool payment type
3. **Adds `metadata` JSONB column** - Stores tool payment information
4. **Creates index** - Improves query performance for tool payments

## Troubleshooting

### Error: "Failed to create payment record"

This means the migration hasn't been run. Follow Step 1 above.

### Error: "constraint violation"

The migration partially ran. Drop and recreate the constraint:

```sql
ALTER TABLE payments 
DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE payments 
ADD CONSTRAINT payments_payment_type_check 
CHECK (payment_type IN ('subscription', 'one_time', 'tool'));
```

### Error: "column user_id does not allow null"

Run this SQL:

```sql
ALTER TABLE payments 
ALTER COLUMN user_id DROP NOT NULL;
```

