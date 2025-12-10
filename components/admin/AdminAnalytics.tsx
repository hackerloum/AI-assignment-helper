'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, FileText, TrendingUp, CreditCard, CheckCircle2 } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalPayments: number;
  totalRevenue: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  activeUsers: number;
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.activeUsers || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(data?.totalRevenue || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {data?.totalPayments || 0} total payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.pendingSubmissions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {data?.approvedSubmissions || 0} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data && data.approvedSubmissions + data.pendingSubmissions > 0
                ? Math.round(
                    (data.approvedSubmissions /
                      (data.approvedSubmissions + data.pendingSubmissions)) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Submission approval rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Review Submissions</h3>
              <p className="text-sm text-muted-foreground">
                {data?.pendingSubmissions || 0} pending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-muted-foreground">
                View and manage user accounts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-semibold">Payment Management</h3>
              <p className="text-sm text-muted-foreground">
                View and process payments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

