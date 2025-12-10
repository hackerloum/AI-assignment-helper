# Admin Access Troubleshooting

## Issue: "Access denied" error even with admin role in database

### Quick Fix: Check server console logs

When you try to login, your terminal/console will show:

```
[Check Access] ============ START ============
[Check Access] Checking user_id: bdaabaf6-190a-42ef-85b6-39a5054627c2
[Check Access] Query error: null
[Check Access] All roles found: [ { role: 'admin', user_id: '...' } ]
[Check Access] Has admin role? true
[Check Access] ============ END ============
```

**If you see "Has admin role? false"** → The role isn't in the database correctly

**If you see "Query error: [some error]"** → There's a database connection issue

**If you see "All roles found: []"** → The user_id doesn't match

---

## Solution 1: Recreate Admin Role (Most Common Fix)

Run this SQL in Supabase SQL Editor:

```sql
-- Step 1: Delete existing role
DELETE FROM user_roles WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'mudiallymohamed@gmail.com'
);

-- Step 2: Create admin role with correct user_id
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT id, 'admin', id, NOW()
FROM auth.users
WHERE email = 'mudiallymohamed@gmail.com';

-- Step 3: Verify it worked
SELECT 
  u.id as user_id,
  u.email,
  ur.role,
  CASE WHEN u.id = ur.user_id THEN '✅ MATCH' ELSE '❌ MISMATCH' END as status
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'mudiallymohamed@gmail.com';
```

---

## Solution 2: Check User ID

Run this SQL to verify the user_id:

```sql
-- Get the actual user_id from auth.users
SELECT id, email FROM auth.users WHERE email = 'mudiallymohamed@gmail.com';

-- Check what's in user_roles
SELECT * FROM user_roles WHERE role = 'admin';

-- Compare them
SELECT 
  'auth.users' as source,
  id as user_id,
  email
FROM auth.users
WHERE email = 'mudiallymohamed@gmail.com'
UNION ALL
SELECT 
  'user_roles' as source,
  user_id,
  role as email
FROM user_roles
WHERE role = 'admin';
```

---

## Solution 3: Manual Override (If database is correct but still failing)

If the database shows correct data but it still doesn't work, there might be a caching issue.

### Option A: Clear everything and start fresh

1. **In your browser:**
   - Open Dev Tools (F12)
   - Application tab → Clear site data
   - Close browser completely
   - Reopen and try again

2. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

### Option B: Temporary bypass (for debugging)

**ONLY FOR DEBUGGING** - This bypasses security:

```sql
-- Temporarily make this user a super admin (REMOVE AFTER DEBUGGING)
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'mudiallymohamed@gmail.com'
);
```

---

## What the Logs Should Show

### Successful Login:
```
[Check Access] ============ START ============
[Check Access] Checking user_id: bdaabaf6-190a-42ef-85b6-39a5054627c2
[Check Access] Query error: null
[Check Access] All roles found: [
  {
    "id": "...",
    "user_id": "bdaabaf6-190a-42ef-85b6-39a5054627c2",
    "role": "admin",
    "granted_at": "2025-12-10T19:14:14.206483+00:00",
    ...
  }
]
[Check Access] Has admin role? true  ← MUST BE TRUE
[Check Access] ============ END ============
```

### Failed Login:
```
[Check Access] All roles found: []  ← EMPTY ARRAY = NO ROLE FOUND
[Check Access] Has admin role? false
```

---

## Still Not Working?

1. **Check the server console** - What do you see in the logs?
2. **Run Solution 1 SQL** - Recreate the role from scratch
3. **Clear browser cookies** - Force a fresh login
4. **Restart dev server** - Clear any caching

If it still doesn't work after trying all of these, share:
1. The server console logs
2. Result of this SQL:
   ```sql
   SELECT * FROM user_roles WHERE role = 'admin';
   ```

