'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
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
  ArrowRight,
  LogOut,
  User,
  Activity,
  FileText as FileTextIcon,
  Download,
  Bell,
  FileCheck,
  Heart,
  Settings,
  LayoutTemplate
} from 'lucide-react';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminUsersManagement } from './AdminUsersManagement';
import { AdminPaymentsManagement } from './AdminPaymentsManagement';
import { AdminSubmissionsManagement } from './AdminSubmissionsManagement';
import { AdminSettings } from './AdminSettings';
import { AdminActivityLogs } from './AdminActivityLogs';
import { AdminTemplatesManagement } from './AdminTemplatesManagement';
import { AdminReportsExport } from './AdminReportsExport';
import { AdminAnnouncements } from './AdminAnnouncements';
import { AdminSystemHealth } from './AdminSystemHealth';
import { AdminContentManagement } from './AdminContentManagement';
import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// Sliding indicator component
function SlidingIndicator({ 
  activeTabId, 
  tabRefs 
}: { 
  activeTabId: string; 
  tabRefs: { [key: string]: HTMLButtonElement | null } 
}) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    const activeTab = tabRefs[activeTabId];
    if (activeTab) {
      const container = activeTab.closest('.relative');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        setIndicatorStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
        });
      }
    }
  };

  useEffect(() => {
    updateIndicator();
    
    // Update on window resize
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTabId]);

  // Update when tabs are rendered (after a small delay to ensure DOM is ready)
  useEffect(() => {
    const timer = setTimeout(updateIndicator, 0);
    return () => clearTimeout(timer);
  }, [activeTabId, tabRefs]);

  return (
    <motion.div
      layoutId="activeTabIndicator"
      className="absolute bottom-2 h-10 bg-amber-500/20 rounded-xl border border-amber-500/40 shadow-lg shadow-amber-500/10 pointer-events-none z-0"
      initial={false}
      animate={{
        x: indicatorStyle.left,
        width: indicatorStyle.width,
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 35,
        mass: 0.5
      }}
      style={{
        left: 0,
      }}
    />
  );
}

export function AdminDashboard() {
  const { user } = useUser();
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/cp/login');
    setProfileOpen(false);
  };

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
      value: formatCurrency(analytics.totalRevenue || 0),
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
    { id: 'content', label: 'Content', icon: FileCheck },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'reports', label: 'Reports', icon: Download },
    { id: 'announcements', label: 'Announcements', icon: Bell },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'health', label: 'System Health', icon: Heart },
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
    <div className="min-h-screen space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-dashboard-bg/80 backdrop-blur-xl border-b border-dashboard-border -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 md:py-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Admin Control Panel
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage your platform and monitor activity
              </p>
            </div>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <motion.button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 px-4 py-2.5 bg-dashboard-elevated border border-dashboard-border rounded-xl hover:border-amber-500/30 transition-all group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white">
                  {user?.user_metadata?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </motion.button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-64 bg-dashboard-elevated border border-dashboard-border rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-dashboard-border">
                  <p className="text-sm font-semibold text-white">
                    {user?.user_metadata?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                    <Shield className="w-3 h-3" />
                    Administrator
                  </span>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

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
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl shadow-xl overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-dashboard-surface/50 border-b border-dashboard-border px-4 md:px-6 py-4">
          <div className="relative">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    ref={(el) => { tabRefs.current[tab.id] = el; }}
                    onClick={() => handleTabChange(tab.id)}
                    type="button"
                    className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer font-medium z-10 ${
                      isActive
                        ? 'text-amber-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="text-sm font-semibold relative z-10">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
            {/* Sliding indicator */}
            {tabRefs.current[activeTab] && (
              <SlidingIndicator activeTabId={activeTab} tabRefs={tabRefs.current} />
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && <AdminAnalytics />}
            {activeTab === 'users' && <AdminUsersManagement />}
            {activeTab === 'payments' && <AdminPaymentsManagement />}
            {activeTab === 'submissions' && <AdminSubmissionsManagement />}
            {activeTab === 'content' && <AdminContentManagement />}
            {activeTab === 'templates' && <AdminTemplatesManagement />}
            {activeTab === 'reports' && <AdminReportsExport />}
            {activeTab === 'announcements' && <AdminAnnouncements />}
            {activeTab === 'activity' && <AdminActivityLogs />}
            {activeTab === 'health' && <AdminSystemHealth />}
            {activeTab === 'settings' && <AdminSettings />}
          </motion.div>
        </div>
      </div>
      
      {/* Click outside to close profile dropdown */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
