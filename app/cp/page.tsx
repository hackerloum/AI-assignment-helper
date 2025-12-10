import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin/auth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default async function ControlPanelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/cp/login');
  }

  const userIsAdmin = await isAdmin();
  
  if (!userIsAdmin) {
    redirect('/cp/login?error=unauthorized');
  }

  return <AdminDashboard />;
}

