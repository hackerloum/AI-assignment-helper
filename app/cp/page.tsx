import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function ControlPanelPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect('/cp/login');
    }

    console.log('='.repeat(80));
    console.log('[ADMIN PAGE] User:', user.email, 'ID:', user.id);

    const adminClient = createAdminClient();
    
    // Simple query
    const { data: roles, error } = await adminClient
      .from('user_roles')
      .select('role, user_id')
      .eq('user_id', user.id);
    
    console.log('[ADMIN PAGE] Query error:', error?.message || 'none');
    console.log('[ADMIN PAGE] Roles:', JSON.stringify(roles, null, 2));
    
    const hasAdmin = roles && roles.some(r => r.role === 'admin');
    console.log('[ADMIN PAGE] Has admin?', hasAdmin);
    console.log('='.repeat(80));

    if (!hasAdmin) {
      redirect('/cp/login?error=unauthorized');
    }

    return <AdminDashboard />;
  } catch (error: any) {
    console.error('[ADMIN PAGE] Error:', error.message);
    redirect('/cp/login?error=unauthorized');
  }
}
