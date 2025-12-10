'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function ControlPanelPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const supabase = createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          router.push('/cp/login');
          return;
        }

        // Check admin access via API
        const response = await fetch('/api/admin/check-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) {
          router.push('/cp/login?error=unauthorized');
          return;
        }

        const result = await response.json();

        if (result.hasAccess) {
          setHasAccess(true);
          setIsChecking(false);
        } else {
          router.push('/cp/login?error=unauthorized');
        }
      } catch (err: any) {
        setError(err.message);
        router.push('/cp/login?error=unauthorized');
      }
    }

    checkAdminAccess();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button onClick={() => router.push('/cp/login')} className="btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <AdminDashboard />;
  }

  return null;
}
