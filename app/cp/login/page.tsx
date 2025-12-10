'use client';

/**
 * Admin Login Page - Disguised as Control Panel
 * Route: /cp/login (not /admin/login to avoid obvious admin access)
 */

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

  // Check for error parameter in URL
  useEffect(() => {
    try {
      const errorParam = searchParams?.get('error');
      if (errorParam === 'unauthorized') {
        setError('Access denied. You do not have admin permissions. Please verify you have been granted admin role in the database.');
      }
    } catch (e) {
      // Ignore errors if searchParams is not available
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Attempt login
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data?.user) {
        setError('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Wait a moment for cookies to be set
      await new Promise(resolve => setTimeout(resolve, 500));

      // Verify admin role - pass userId directly
      const response = await fetch('/api/admin/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      });

      if (!response.ok) {
        console.error('Check access failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to verify admin access. Please try again.');
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      const { hasAccess, error: accessError } = result;

      if (!hasAccess) {
        // Sign out if not admin
        await supabase.auth.signOut();
        setError(accessError || 'Access denied. You do not have permission to access this area. Make sure you have been granted admin role.');
        setIsLoading(false);
        return;
      }

      // Redirect to control panel dashboard
      // Use window.location.href for a full page reload to ensure cookies are available
      setTimeout(() => {
        window.location.href = '/cp';
      }, 300);
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Control Panel Access</CardTitle>
          <CardDescription>
            Enter your credentials to access the system control panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access Control Panel'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>This is a restricted area. Unauthorized access is prohibited.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

