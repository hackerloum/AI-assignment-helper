# Admin Dashboard Setup Guide

## Overview

The admin dashboard is accessible at `/cp/login` (not `/admin` to avoid obvious admin access points). The system uses role-based access control (RBAC) to manage admin permissions.

## Features

- **User Management**: View all users, grant/revoke admin roles, view payment status
- **Payment Management**: View all payments, track revenue, payment status
- **Submission Management**: Review and approve student submissions
- **Analytics Dashboard**: Overview of users, revenue, submissions, and key metrics
- **Admin Settings**: System configuration and security recommendations

## Initial Setup

### 1. Run Database Migration

First, apply the admin system migration:

```bash
# Using Supabase CLI
supabase migration up

# Or manually run the SQL file:
# supabase/migrations/009_add_admin_system.sql
```

### 2. Create First Admin User

You have two options:

#### Option A: Using SQL (Recommended)

1. First, register a user account through the normal registration flow
2. Then run this SQL in your Supabase SQL editor:

```sql
-- Replace 'your-admin@email.com' with your admin email
INSERT INTO user_roles (user_id, role, granted_by, granted_at)
SELECT id, 'admin', id, NOW()
FROM auth.users
WHERE email = 'your-admin@email.com';
```

#### Option B: Using the Script

1. First, register a user account through the normal registration flow
2. Then run:

```bash
npx tsx scripts/create-admin.ts your-admin@email.com
```

### 3. Access Admin Dashboard

1. Navigate to `/cp/login`
2. Login with your admin account credentials
3. You'll be redirected to the admin dashboard at `/cp`

## Security Features

- **Obfuscated URL**: Admin access is at `/cp/login` instead of `/admin` to reduce visibility
- **Role-Based Access**: Only users with `admin` role can access admin features
- **Activity Logging**: All admin actions are logged for audit trails
- **Middleware Protection**: Admin routes are protected at the middleware level

## Admin Routes

- `/cp/login` - Admin login page
- `/cp` - Admin dashboard (redirects to `/cp/login` if not authenticated)
- `/api/admin/*` - Admin API endpoints (protected)

## User Roles

- **user** (default) - Regular user access
- **moderator** - Can review submissions and moderate content
- **admin** - Full access to all admin features

## API Endpoints

### Admin Endpoints

- `GET /api/admin/analytics` - Get dashboard analytics
- `GET /api/admin/users` - List all users
- `POST /api/admin/grant-role` - Grant admin/moderator role
- `POST /api/admin/revoke-role` - Revoke admin/moderator role
- `GET /api/admin/payments` - List all payments

All admin endpoints require admin authentication and will return `403 Forbidden` if accessed by non-admin users.

## Granting Admin Access

Admins can grant admin access to other users through the dashboard:

1. Go to the "Users" tab in the admin dashboard
2. Find the user you want to grant admin access to
3. Click "Grant Admin" button
4. Confirm the action

## Revoking Admin Access

1. Go to the "Users" tab in the admin dashboard
2. Find the admin user
3. Click "Revoke Admin" button
4. Confirm the action

**Note**: Admins cannot revoke their own admin access.

## Troubleshooting

### Cannot Access Admin Dashboard

1. Verify you have admin role in the database:
   ```sql
   SELECT * FROM user_roles WHERE user_id = 'your-user-id';
   ```

2. Check that the migration was applied:
   ```sql
   SELECT * FROM user_roles LIMIT 1;
   ```

3. Clear browser cookies and try again

### API Returns 403 Forbidden

- Verify your user has the `admin` role
- Check that you're logged in with the correct account
- Ensure the `user_roles` table exists and has your user record

## Database Schema

### user_roles

- `id` - UUID primary key
- `user_id` - Reference to auth.users
- `role` - 'admin', 'moderator', or 'user'
- `granted_by` - User who granted the role
- `granted_at` - Timestamp
- `created_at` - Timestamp
- `updated_at` - Timestamp

### admin_activity_log

- `id` - UUID primary key
- `admin_id` - Reference to auth.users
- `action` - Action performed
- `resource_type` - Type of resource affected
- `resource_id` - ID of resource affected
- `details` - JSONB with additional details
- `ip_address` - IP address of admin
- `user_agent` - User agent string
- `created_at` - Timestamp

## Best Practices

1. **Limit Admin Access**: Only grant admin access to trusted users
2. **Regular Audits**: Review admin activity logs regularly
3. **Strong Passwords**: Ensure admin accounts use strong passwords
4. **Secure URL**: Don't publicly share the `/cp/login` URL
5. **Monitor Activity**: Keep an eye on admin actions through the activity logs

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check server logs for detailed error messages
3. Verify database migrations are applied
4. Ensure environment variables are set correctly

