# Admin Login Quick Start

## Password for Admin Login

**The password is the same password you used when you created your account.**

If you forgot your password:
1. Go to the regular login page (`/login`)
2. Click "Forgot Password"
3. Reset your password
4. Then use the new password to login at `/cp/login`

## Step-by-Step: First Time Admin Access

### Step 1: Make Sure Your Account Exists
- If you already registered at `/register`, you're good ✅
- If not, go to `/register` and create an account with your email

### Step 2: Grant Yourself Admin Role

You need to run this SQL in your Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with the email you registered with
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT id, 'admin', id, NOW()
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin', updated_at = NOW();
```

**How to run this:**
1. Go to your Supabase Dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL above (replace the email)
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned" or similar

### Step 3: Verify Admin Role (Optional Check)

Run this to verify you have admin access:

```sql
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'your-email@example.com';
```

You should see your email with role = 'admin'

### Step 4: Login to Admin Dashboard

1. Go to: `http://localhost:3000/cp/login` (or your domain + `/cp/login`)
2. Enter your email
3. Enter the password you used when registering
4. Click "Access Control Panel"
5. You should be redirected to the admin dashboard

## Troubleshooting

### "Access denied" or 401 Error
1. **First, verify you have admin role:**
   ```bash
   npx tsx scripts/verify-admin.ts your-email@example.com
   ```
   Or check in Supabase SQL Editor:
   ```sql
   SELECT u.email, ur.role
   FROM auth.users u
   LEFT JOIN user_roles ur ON u.id = ur.user_id
   WHERE u.email = 'your-email@example.com';
   ```

2. **If no admin role, grant it:**
   - Run the SQL from Step 2 above, OR
   - Run: `npx tsx scripts/create-admin.ts your-email@example.com`

3. **If you have admin role but still getting errors:**
   - Clear browser cookies and try again
   - Make sure you're using the correct password (your registration password)
   - Check browser console for specific error messages

### "Invalid credentials" Error
- This means your email/password is wrong
- Use the "Forgot Password" link on the regular login page to reset
- Or try logging in at `/login` first to verify your credentials work

### Can't Find SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left menu
4. Click "New Query" button

### Password Reset (If You Forgot)
1. Go to `/login` (regular login page)
2. Click "Forgot Password" link
3. Enter your email
4. Check your email for reset link
5. Set a new password
6. Use that new password at `/cp/login`

## Quick Checklist

- [ ] Account exists (registered at `/register`)
- [ ] Ran SQL to grant admin role (Step 2 above)
- [ ] Verified admin role: `npx tsx scripts/verify-admin.ts your-email@example.com`
- [ ] Can login at `/cp/login` with your email and password

## Verify Admin Status

If you're not sure if you have admin role, run:

```bash
npx tsx scripts/verify-admin.ts your-email@example.com
```

This will show you:
- ✅ If you have admin role
- ❌ If you don't have admin role (and how to fix it)
- Your user ID and role details

## Security Note

- Keep your admin password strong and secure
- Don't share the `/cp/login` URL publicly
- Only grant admin access to trusted users

