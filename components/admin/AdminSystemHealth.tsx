'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Server, Zap, CheckCircle2, AlertCircle, Clock, HardDrive } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    averageResponseTime: number;
    requestsPerMinute: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: string;
}

export function AdminSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/system-health', {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setHealth(result.health);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'warning': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      default: return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'healthy' ? CheckCircle2 : AlertCircle;
  };

  if (loading || !health) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
        <p className="text-slate-400 mt-4">Loading system health...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">System Health</h2>
        <p className="text-sm text-slate-400 mt-1">Monitor system performance and status</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Database Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Database className={`w-8 h-8 ${
              health.database.status === 'healthy' ? 'text-emerald-400' :
              health.database.status === 'warning' ? 'text-amber-400' :
              'text-red-400'
            }`} />
            {(() => {
              const Icon = getStatusIcon(health.database.status);
              return <Icon className={`w-5 h-5 ${
                health.database.status === 'healthy' ? 'text-emerald-400' :
                health.database.status === 'warning' ? 'text-amber-400' :
                'text-red-400'
              }`} />;
            })()}
          </div>
          <h3 className="text-sm text-slate-400 mb-1">Database</h3>
          <div className="text-2xl font-bold text-white mb-2">
            {health.database.responseTime}ms
          </div>
          <div className="text-xs text-slate-500">
            {health.database.connections} connections
          </div>
        </motion.div>

        {/* API Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Server className={`w-8 h-8 ${
              health.api.status === 'healthy' ? 'text-emerald-400' :
              health.api.status === 'warning' ? 'text-amber-400' :
              'text-red-400'
            }`} />
            {(() => {
              const Icon = getStatusIcon(health.api.status);
              return <Icon className={`w-5 h-5 ${
                health.api.status === 'healthy' ? 'text-emerald-400' :
                health.api.status === 'warning' ? 'text-amber-400' :
                'text-red-400'
              }`} />;
            })()}
          </div>
          <h3 className="text-sm text-slate-400 mb-1">API</h3>
          <div className="text-2xl font-bold text-white mb-2">
            {health.api.averageResponseTime}ms
          </div>
          <div className="text-xs text-slate-500">
            {health.api.requestsPerMinute} req/min
          </div>
        </motion.div>

        {/* Storage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <HardDrive className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-sm text-slate-400 mb-1">Storage</h3>
          <div className="text-2xl font-bold text-white mb-2">
            {health.storage.percentage}%
          </div>
          <div className="text-xs text-slate-500">
            {health.storage.used}GB / {health.storage.total}GB
          </div>
          <div className="mt-2 w-full bg-white/5 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                health.storage.percentage > 80 ? 'bg-red-500' :
                health.storage.percentage > 60 ? 'bg-amber-500' :
                'bg-emerald-500'
              }`}
              style={{ width: `${health.storage.percentage}%` }}
            />
          </div>
        </motion.div>

        {/* Uptime */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-sm text-slate-400 mb-1">Uptime</h3>
          <div className="text-2xl font-bold text-white mb-2">
            {health.uptime}
          </div>
          <div className="text-xs text-slate-500">
            System availability
          </div>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-slate-400 mb-2">Database Response Time</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    health.database.responseTime < 50 ? 'bg-emerald-500' :
                    health.database.responseTime < 100 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (health.database.responseTime / 200) * 100)}%` }}
                />
              </div>
              <span className="text-sm text-white">{health.database.responseTime}ms</span>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-2">API Response Time</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    health.api.averageResponseTime < 100 ? 'bg-emerald-500' :
                    health.api.averageResponseTime < 300 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (health.api.averageResponseTime / 500) * 100)}%` }}
                />
              </div>
              <span className="text-sm text-white">{health.api.averageResponseTime}ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

