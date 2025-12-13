'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Activity, Filter, Search, Download } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_email?: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/activity-logs', {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setLogs(result.logs || []);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('revoke')) return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (action.includes('create') || action.includes('grant')) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (action.includes('update') || action.includes('modify')) return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
          <p className="text-sm text-slate-400 mt-1">Audit trail of all admin actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            <p className="text-slate-400 mt-4">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No activity logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dashboard-surface/50 border-b border-dashboard-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Admin</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Resource</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dashboard-border hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-300">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-white">{log.admin_email || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-300">
                        {log.resource_type || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs text-slate-500 font-mono">{log.ip_address}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

