import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function ControlPanelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/cp/login');
  }

  // Check admin status directly using admin client (bypasses RLS)
  // This works even if cookies aren't fully synced yet
  try {
    const adminClient = createAdminClient();
    
    console.log('[Admin Check] User ID:', user.id);
    console.log('[Admin Check] Email:', user.email);

    // Query for admin role - use array instead of single() to avoid errors
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    console.log('[Admin Check] Query result:', roleData);
    console.log('[Admin Check] Query error:', roleError);

    // Check if we found an admin role
    const hasAdminRole = roleData && roleData.length > 0 && roleData[0].role === 'admin';

    if (roleError || !hasAdminRole) {
      console.log('[Admin] ❌ Access denied for user:', user.id, user.email);
      console.log('[Admin] Role data:', roleData);
      console.log('[Admin] Has admin role:', hasAdminRole);
      console.log('[Admin] Error:', roleError?.message || 'No admin role found');
      
      // Also check what roles exist for this user
      const { data: allRoles } = await adminClient
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      console.log('[Admin] All roles for user:', allRoles);
      
      redirect('/cp/login?error=unauthorized');
    }

    console.log('[Admin] ✅ Access granted for admin user:', user.email);
  } catch (error: any) {
    console.error('[Admin] ❌ Error checking admin status:', error);
    console.error('[Admin] Error stack:', error.stack);
    redirect('/cp/login?error=unauthorized');
  }

  return <AdminDashboard />;
}

