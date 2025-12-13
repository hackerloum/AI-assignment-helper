'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Shield } from 'lucide-react';

export default function ControlPanelLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const errorParam = searchParams?.get('error');
      if (errorParam === 'unauthorized') {
        setError('Access denied. You do not have admin permissions. Please verify you have been granted admin role in the database.');
      }
    } catch (e) {
      // Ignore
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !data?.user) {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
        return;
      }

      // Wait for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check admin access
      const response = await fetch('/api/admin/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      });

      if (!response.ok) {
        setError('Failed to verify admin access. Please try again.');
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (!result.hasAccess) {
        await supabase.auth.signOut();
        setError('Access denied. You do not have admin permissions. Please verify you have been granted admin role in the database.');
        setIsLoading(false);
        return;
      }

      // Wait for cookies and verify session is ready
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify session is available
        const { data: { user: verifyUser } } = await supabase.auth.getUser();
        
        if (verifyUser && verifyUser.id === data.user.id) {
          // Double-check admin access one more time
          const verifyResponse = await fetch('/api/admin/check-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: verifyUser.id }),
          });
          
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.hasAccess) {
            // Session is ready and admin verified - redirect now
            window.location.replace('/cp');
            return;
          }
        }
      }
      
      // If we get here, session wasn't ready in time
      setError('Session not ready. Please try refreshing the page.');
      setIsLoading(false);
      
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        <Card className="bg-slate-800/90 backdrop-blur-xl border-slate-700/50 shadow-2xl">
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-amber-500/20 p-4 ring-4 ring-amber-500/10">
                <Shield className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white">Admin Control Panel</CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Enter your credentials to access the system administration panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 text-base shadow-lg shadow-amber-500/25 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Access Control Panel
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <AlertCircle className="h-3 w-3" />
                <p>Restricted access. Authorized personnel only.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
