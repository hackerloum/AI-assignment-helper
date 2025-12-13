'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  CreditCard,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get access token from Supabase
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/analytics', {
        headers,
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Unauthorized access to analytics');
          setData({
            totalUsers: 0,
            totalPayments: 0,
            totalRevenue: 0,
            pendingSubmissions: 0,
            approvedSubmissions: 0,
            activeUsers: 0,
          });
          setLoading(false);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch analytics:', result.error);
        setData({
          totalUsers: 0,
          totalPayments: 0,
          totalRevenue: 0,
          pendingSubmissions: 0,
          approvedSubmissions: 0,
          activeUsers: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setData({
        totalUsers: 0,
        totalPayments: 0,
        totalRevenue: 0,
        pendingSubmissions: 0,
        approvedSubmissions: 0,
        activeUsers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-24 mb-4" />
              <div className="h-8 bg-white/5 rounded w-16 mb-2" />
              <div className="h-3 bg-white/5 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Failed to load analytics data</p>
      </div>
    );
  }

  const successRate = data.approvedSubmissions + data.pendingSubmissions > 0
    ? Math.round((data.approvedSubmissions / (data.approvedSubmissions + data.pendingSubmissions)) * 100)
    : 0;

  const quickActions = [
    {
      title: 'Review Submissions',
      description: `${data.pendingSubmissions || 0} pending reviews`,
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      onClick: () => router.push('/cp?tab=submissions'),
    },
    {
      title: 'Manage Users',
      description: `${data.totalUsers || 0} total users`,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      onClick: () => router.push('/cp?tab=users'),
    },
    {
      title: 'View Payments',
      description: `$${((data.totalRevenue || 0) / 100).toLocaleString()} revenue`,
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      onClick: () => router.push('/cp?tab=payments'),
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Additional Metrics */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 overflow-hidden group hover:border-blue-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{data.activeUsers || 0}</h3>
            <p className="text-sm text-slate-400">Active Users</p>
            <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 overflow-hidden group hover:border-green-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{data.approvedSubmissions || 0}</h3>
            <p className="text-sm text-slate-400">Approved Submissions</p>
            <p className="text-xs text-slate-500 mt-2">{successRate}% approval rate</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 overflow-hidden group hover:border-yellow-500/30 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <ArrowDownRight className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{data.pendingSubmissions || 0}</h3>
            <p className="text-sm text-slate-400">Pending Reviews</p>
            <p className="text-xs text-slate-500 mt-2">Requires attention</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={action.onClick}
                className="relative bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 overflow-hidden group hover:border-amber-500/30 transition-all duration-300 text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className="relative">
                  <div className={`${action.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${action.textColor}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-sm text-amber-400 group-hover:gap-2 transition-all">
                    <span>View details</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
