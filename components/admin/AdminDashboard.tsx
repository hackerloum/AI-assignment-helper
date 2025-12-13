'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Shield,
  BarChart3,
  CreditCard,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminUsersManagement } from './AdminUsersManagement';
import { AdminPaymentsManagement } from './AdminPaymentsManagement';
import { AdminSubmissionsManagement } from './AdminSubmissionsManagement';
import { AdminSettings } from './AdminSettings';
import { useUser } from '@/hooks/useUser';

export function AdminDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    
    // Check URL for tab parameter
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Unauthorized access to analytics');
          setAnalytics({
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
        setAnalytics(result.data);
      } else {
        console.error('Failed to fetch analytics:', result.error);
        setAnalytics({
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
      setAnalytics({
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

  const stats = analytics ? [
    {
      name: 'Total Users',
      value: analytics.totalUsers.toString(),
      change: `${analytics.activeUsers || 0} active`,
      trend: 'up' as const,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Total Revenue',
      value: `$${((analytics.totalRevenue || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${analytics.totalPayments || 0} payments`,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      name: 'Pending Reviews',
      value: (analytics.pendingSubmissions || 0).toString(),
      change: `${analytics.approvedSubmissions || 0} approved`,
      trend: 'up' as const,
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      name: 'Success Rate',
      value: analytics && (analytics.approvedSubmissions + analytics.pendingSubmissions) > 0
        ? `${Math.round((analytics.approvedSubmissions / (analytics.approvedSubmissions + analytics.pendingSubmissions)) * 100)}%`
        : '0%',
      change: 'approval rate',
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ] : [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Shield },
  ];

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (tab === 'overview') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      window.history.pushState({}, '', url);
    }
  };

  return (
    <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Admin'}! 👋
            </h1>
          </div>
          <p className="text-lg md:text-xl text-slate-400 font-medium">
            Manage your platform and monitor system activity
          </p>
        </motion.div>

      {/* Stats Cards */}
      {!loading && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 md:p-7 overflow-hidden group hover:border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 backdrop-blur-sm"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.change}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-400">{stat.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-32 mb-4" />
              <div className="h-10 bg-white/5 rounded w-24 mb-2" />
              <div className="h-3 bg-white/5 rounded w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-3 scrollbar-hide border-b border-dashboard-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                type="button"
                className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
                <span className="text-sm font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'overview' && <AdminAnalytics />}
          {activeTab === 'users' && <AdminUsersManagement />}
          {activeTab === 'payments' && <AdminPaymentsManagement />}
          {activeTab === 'submissions' && <AdminSubmissionsManagement />}
          {activeTab === 'settings' && <AdminSettings />}
        </div>
      </div>
    </div>
  );
}
