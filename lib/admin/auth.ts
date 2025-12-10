/**
 * Admin Authentication & Authorization Utilities
 * Handles admin role checks and permissions
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

export type UserRole = 'admin' | 'moderator' | 'user';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  grantedAt?: string;
}

/**
 * Check if the current authenticated user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Check role using service role client (bypasses RLS)
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === 'admin';
  } catch (error) {
    console.error('[Admin Auth] Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if the current authenticated user is a moderator or admin
 */
export async function isModeratorOrAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator'])
      .single();

    if (error || !data) {
      return false;
    }

    return ['admin', 'moderator'].includes(data.role);
  } catch (error) {
    console.error('[Admin Auth] Error checking moderator/admin status:', error);
    return false;
  }
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return 'user'; // Default role
    }

    return data.role as UserRole;
  } catch (error) {
    console.error('[Admin Auth] Error getting user role:', error);
    return null;
  }
}

/**
 * Get admin user details
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('user_roles')
      .select('role, granted_at')
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: data.role as UserRole,
      grantedAt: data.granted_at,
    };
  } catch (error) {
    console.error('[Admin Auth] Error getting admin user:', error);
    return null;
  }
}

/**
 * Log admin activity for audit trail
 */
export async function logAdminActivity(
  adminId: string,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>,
  request?: Request
): Promise<void> {
  try {
    const adminClient = createAdminClient();
    
    // Extract IP and user agent from request if available
    const ipAddress = request?.headers.get('x-forwarded-for') || 
                     request?.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await adminClient.from('admin_activity_log').insert({
      admin_id: adminId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {},
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('[Admin Auth] Error logging admin activity:', error);
    // Don't throw - logging failures shouldn't break admin operations
  }
}

/**
 * Grant admin role to a user (admin only operation)
 */
export async function grantAdminRole(
  userId: string,
  role: UserRole = 'admin',
  grantedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient();
    
    const { error } = await adminClient
      .from('user_roles')
      .upsert({
        user_id: userId,
        role,
        granted_by: grantedBy,
        granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('[Admin Auth] Error granting role:', error);
      return { success: false, error: error.message };
    }

    // Log the action
    await logAdminActivity(grantedBy, 'grant_role', 'user_roles', userId, {
      targetUserId: userId,
      role,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Admin Auth] Error granting role:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Revoke admin role from a user
 */
export async function revokeAdminRole(
  userId: string,
  revokedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient();
    
    const { error } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('[Admin Auth] Error revoking role:', error);
      return { success: false, error: error.message };
    }

    // Log the action
    await logAdminActivity(revokedBy, 'revoke_role', 'user_roles', userId, {
      targetUserId: userId,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Admin Auth] Error revoking role:', error);
    return { success: false, error: error.message };
  }
}

