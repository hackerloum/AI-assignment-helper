# 🚨 EMERGENCY FIX - Manual Payment Update

## Problem
Payment was successful but database didn't update `has_paid_one_time_fee` to `true`, preventing dashboard access.

## Quick Fix Using Admin Endpoint

### Option 1: Using Order ID (Recommended)
```bash
curl -X POST https://your-domain.com/api/admin/mark-paid \
  -H "Content-Type: application/json" \
  -d '{"orderId": "YOUR_ORDER_ID_HERE"}'
```

Replace `YOUR_ORDER_ID_HERE` with the Order ID from your payment confirmation (e.g., `33a73fd6...`)

### Option 2: Using Email
```bash
curl -X POST https://your-domain.com/api/admin/mark-paid \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### Option 3: Check Current Status First
```bash
curl "https://your-domain.com/api/admin/mark-paid?email=your-email@example.com"
```

## Using Browser (Easier)

1. **Open your browser**
2. **Go to your deployed app**
3. **Open Developer Console** (Press F12)
4. **Run this command** (replace with your details):

```javascript
fetch('/api/admin/mark-paid', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 'YOUR_ORDER_ID_HERE'  // or use email: 'your@email.com'
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
```

## Direct Database Fix (Supabase Dashboard)

1. Go to your Supabase dashboard
2. Go to **Table Editor** → `user_credits` table
3. Find your user by `user_id`
4. If row exists:
   - Click **Edit**
   - Set `has_paid_one_time_fee` to `true`
   - Click **Save**
5. If row doesn't exist:
   - Click **Insert row**
   - Fill in:
     - `user_id`: Your user ID (from auth.users table)
     - `balance`: 0
     - `has_paid_one_time_fee`: true
     - Leave other fields as default
   - Click **Save**

## Verify Fix Worked

After applying fix, check status:
```javascript
fetch('/api/payments/check-status')
.then(r => r.json())
.then(d => console.log('Payment status:', d))
```

Should return: `{ "hasPaid": true, "userId": "..." }`

## Then Try Dashboard

After fixing, try accessing: `https://your-domain.com/dashboard`

Should now allow access without redirecting to payment page.

## Root Cause Investigation

The database update is failing because of RLS (Row Level Security) policies or the record doesn't exist.

### Check if user_credits table has proper policies:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'user_credits';

-- Add missing INSERT policy if needed
CREATE POLICY "Allow service role to insert" 
ON user_credits FOR INSERT 
WITH CHECK (true);
```

## Prevention

We need to ensure the payment callback has proper permissions to update user_credits. The service role should bypass RLS.

**Updated migration needed:** See `supabase/migrations/005_fix_user_credits_policies.sql`

