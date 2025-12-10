'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription>
            Manage system-wide settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Admin Access URL</Label>
            <div className="flex items-center gap-2">
              <Input
                value="/cp/login"
                readOnly
                className="bg-muted"
              />
              <Button variant="outline" size="sm">
                Copy
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This URL provides access to the admin control panel. Keep it secure and share only with authorized administrators.
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The admin control panel is accessible at <code>/cp/login</code> instead of the common <code>/admin</code> path to avoid obvious admin access points.
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-4">Security Recommendations</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Only grant admin access to trusted users</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Regularly review admin activity logs</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Use strong passwords for admin accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Monitor failed login attempts</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

