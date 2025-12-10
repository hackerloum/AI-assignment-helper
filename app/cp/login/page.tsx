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

    console.log('=== Admin Login Start ===');

    try {
      const supabase = createClient();
      
      // Login
      console.log('Logging in...');
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !data?.user) {
        console.error('Login failed:', loginError);
        setError('Invalid credentials. Please try again.');
        setIsLoading(false);
        return;
      }

      console.log('Login successful. User ID:', data.user.id);
      console.log('Waiting for cookies...');
      
      // Wait for cookies
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Checking admin access...');
      
      // Check admin
      const response = await fetch('/api/admin/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id }),
      });

      console.log('Check access response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Check access failed:', response.status, errorText);
        setError('Failed to verify admin access. Check server logs.');
        setIsLoading(false);
        return;
      }

      const result = await response.json();
      console.log('Check access result:', result);

      if (!result.hasAccess) {
        await supabase.auth.signOut();
        setError('Access denied. You do not have admin role. Check server console for details.');
        setIsLoading(false);
        return;
      }

      console.log('Admin access granted! Preparing redirect...');
      
      // Wait for cookies and verify session is ready
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify session is available
        const { data: { user: verifyUser } } = await supabase.auth.getUser();
        console.log(`Session check attempt ${i + 1}:`, verifyUser ? 'User found' : 'No user');
        
        if (verifyUser && verifyUser.id === data.user.id) {
          console.log('Session verified! Redirecting...');
          // Double-check admin access one more time
          const verifyResponse = await fetch('/api/admin/check-access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: verifyUser.id }),
          });
          
          const verifyResult = await verifyResponse.json();
          console.log('Final admin check:', verifyResult);
          
          if (verifyResult.hasAccess) {
            // Session is ready and admin verified - redirect now
            window.location.replace('/cp');
            return; // Exit the function
          }
        }
      }
      
      // If we get here, session wasn't ready in time
      console.error('Session not ready after waiting');
      setError('Session not ready. Please try refreshing the page.');
      setIsLoading(false);
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Check console logs.');
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
            <p className="mt-2 text-xs">Check server console for detailed logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
