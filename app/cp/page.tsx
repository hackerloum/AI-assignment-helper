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
    
    // First check if user has any role
    const { data: allRoles, error: allRolesError } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id);

    console.log('[Admin Check] User ID:', user.id);
    console.log('[Admin Check] Email:', user.email);
    console.log('[Admin Check] All roles:', allRoles);
    console.log('[Admin Check] Roles error:', allRolesError);

    // Check specifically for admin role
    const { data: roleData, error: roleError } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    console.log('[Admin Check] Admin role data:', roleData);
    console.log('[Admin Check] Admin role error:', roleError);

    if (roleError || !roleData || roleData.role !== 'admin') {
      console.log('[Admin] ❌ Access denied for user:', user.id, user.email);
      console.log('[Admin] Role data:', roleData);
      console.log('[Admin] Error:', roleError?.message || 'No admin role found');
      redirect('/cp/login?error=unauthorized');
    }

    console.log('[Admin] ✅ Access granted for admin user:', user.email);
  } catch (error: any) {
    console.error('[Admin] ❌ Error checking admin status:', error);
    redirect('/cp/login?error=unauthorized');
  }

  return <AdminDashboard />;
}

