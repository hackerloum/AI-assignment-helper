import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function ControlPanelPage() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('='.repeat(80));
    console.log('[ADMIN PAGE] ========== START ==========');
    console.log('[ADMIN PAGE] User error:', userError?.message || 'none');
    console.log('[ADMIN PAGE] User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('[ADMIN PAGE] ❌ No user, redirecting to login');
      console.log('='.repeat(80));
      redirect('/cp/login');
    }

    console.log('[ADMIN PAGE] User email:', user.email);
    console.log('[ADMIN PAGE] User ID:', user.id);

    const adminClient = createAdminClient();
    
    // Get ALL roles for this user - no filters first
    const { data: allRoles, error: allError } = await adminClient
      .from('user_roles')
      .select('*');
    
    console.log('[ADMIN PAGE] Total roles in DB:', allRoles?.length || 0);
    if (allRoles && allRoles.length > 0) {
      console.log('[ADMIN PAGE] Sample roles:', allRoles.slice(0, 3).map(r => ({
        user_id: r.user_id,
        role: r.role
      })));
    }
    
    // Now get roles for this specific user
    const { data: roles, error } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id);
    
    console.log('[ADMIN PAGE] Query error:', error?.message || 'none');
    console.log('[ADMIN PAGE] Roles for this user:', JSON.stringify(roles, null, 2));
    console.log('[ADMIN PAGE] Number of roles found:', roles?.length || 0);
    
    // Check each role
    if (roles && roles.length > 0) {
      roles.forEach((r, i) => {
        console.log(`[ADMIN PAGE] Role ${i + 1}: "${r.role}" (user_id: ${r.user_id})`);
        console.log(`[ADMIN PAGE] Role ${i + 1} is admin? ${r.role === 'admin'}`);
        console.log(`[ADMIN PAGE] Role ${i + 1} user_id matches? ${r.user_id === user.id}`);
      });
    }
    
    const hasAdmin = roles && roles.length > 0 && roles.some(r => r.role === 'admin');
    console.log('[ADMIN PAGE] Final check - Has admin role?', hasAdmin);
    console.log('[ADMIN PAGE] ========== END ==========');
    console.log('='.repeat(80));

    if (!hasAdmin) {
      console.log('[ADMIN PAGE] ❌ ACCESS DENIED - No admin role found');
      redirect('/cp/login?error=unauthorized');
    }

    console.log('[ADMIN PAGE] ✅ ACCESS GRANTED');
    return <AdminDashboard />;
  } catch (error: any) {
    console.error('[ADMIN PAGE] ❌ EXCEPTION:', error.message);
    console.error('[ADMIN PAGE] Stack:', error.stack);
    redirect('/cp/login?error=unauthorized');
  }
}
