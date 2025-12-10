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

    console.log('[Admin Page] ============ ADMIN CHECK START ============');
    console.log('[Admin Page] User ID:', user.id);
    console.log('[Admin Page] Email:', user.email);

    // Check admin status using admin client (bypasses RLS)
    const adminClient = createAdminClient();
    
    // Get ALL roles for this exact user_id - no filters
    const { data: allUserRoles, error: allRolesError } = await adminClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);
    
    console.log('[Admin Page] Query user_id:', user.id);
    console.log('[Admin Page] All roles query error:', allRolesError);
    console.log('[Admin Page] All roles found:', JSON.stringify(allUserRoles, null, 2));

    // Check if this user has admin role
    const hasAdminRole = allUserRoles && allUserRoles.some(r => r.role === 'admin');

    console.log('[Admin Page] Has admin role?', hasAdminRole);
    console.log('[Admin Page] ============ ADMIN CHECK END ============');

    if (!hasAdminRole) {
      console.log('[Admin Page] ❌ Access DENIED');
      redirect('/cp/login?error=unauthorized');
    }

    console.log('[Admin Page] ✅ Access GRANTED');
    return <AdminDashboard />;
  } catch (error: any) {
    console.error('[Admin Page] ❌ Unexpected error:', error);
    console.error('[Admin Page] Error stack:', error.stack);
    redirect('/cp/login?error=unauthorized');
  }
}
