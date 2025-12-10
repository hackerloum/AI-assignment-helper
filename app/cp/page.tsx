import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function ControlPanelPage() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('[Admin Page] Error getting user:', userError);
    }

    if (!user) {
      console.log('[Admin Page] No user found, redirecting to login');
      redirect('/cp/login');
    }

    console.log('[Admin Page] User found:', user.id, user.email);
    console.log('[Admin Page] User ID type:', typeof user.id);
    console.log('[Admin Page] User ID length:', user.id?.length);

    // Check admin status directly using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    
    // First, let's check ALL roles for this user (no filter)
    const { data: allUserRoles, error: allRolesError } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('[Admin Page] ALL roles for this user_id:', JSON.stringify(allUserRoles, null, 2));
    console.log('[Admin Page] All roles error:', allRolesError?.message);

    // Now query specifically for admin role
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    console.log('[Admin Page] Admin role query result:', JSON.stringify(roleData, null, 2));
    console.log('[Admin Page] Admin role query error:', roleError?.message);
    console.log('[Admin Page] Role data type:', typeof roleData);
    console.log('[Admin Page] Role data is array?', Array.isArray(roleData));
    console.log('[Admin Page] Role data length:', roleData?.length);

    // Check if we found an admin role
    const hasAdminRole = roleData && roleData.length > 0 && roleData[0].role === 'admin';

    if (!hasAdminRole) {
      console.log('[Admin Page] ❌ Access denied - no admin role found');
      console.log('[Admin Page] Role data:', roleData);
      console.log('[Admin Page] Error:', roleError?.message);
      
      // Debug: Check what roles exist for this user
      const { data: allRoles } = await adminClient
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      console.log('[Admin Page] All roles for user:', allRoles);
      
      // Also check by email for debugging
      const { data: authUsers } = await adminClient.auth.admin.listUsers();
      const authUser = authUsers?.users.find(u => u.id === user.id);
      console.log('[Admin Page] Auth user found:', authUser?.email);
      
      redirect('/cp/login?error=unauthorized');
    }

    console.log('[Admin Page] ✅ Access granted for admin user:', user.email);
    return <AdminDashboard />;
  } catch (error: any) {
    console.error('[Admin Page] ❌ Unexpected error:', error);
    console.error('[Admin Page] Error stack:', error.stack);
    redirect('/cp/login?error=unauthorized');
  }
}

