'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Users, DollarSign, FileCheck, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ReportOption {
  id: string;
  name: string;
  description: string;
  icon: any;
  format: 'csv' | 'json';
}

export function AdminReportsExport() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exporting, setExporting] = useState(false);

  const reportOptions: ReportOption[] = [
    {
      id: 'users',
      name: 'Users Report',
      description: 'Export all user data with roles and credits',
      icon: Users,
      format: 'csv',
    },
    {
      id: 'payments',
      name: 'Payments Report',
      description: 'Export all payment transactions',
      icon: DollarSign,
      format: 'csv',
    },
    {
      id: 'submissions',
      name: 'Submissions Report',
      description: 'Export all assignment submissions',
      icon: FileCheck,
      format: 'csv',
    },
    {
      id: 'revenue',
      name: 'Revenue Report',
      description: 'Export revenue analytics by date range',
      icon: DollarSign,
      format: 'csv',
    },
    {
      id: 'activity',
      name: 'Activity Log',
      description: 'Export admin activity logs',
      icon: FileText,
      format: 'json',
    },
  ];

  const handleExport = async (reportId: string) => {
    try {
      setExporting(true);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const params = new URLSearchParams();
      if (dateRange.start) params.append('start', dateRange.start);
      if (dateRange.end) params.append('end', dateRange.end);

      const response = await fetch(`/api/admin/reports/${reportId}?${params}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}_${new Date().toISOString().split('T')[0]}.${reportOptions.find(r => r.id === reportId)?.format || 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Reports & Export</h2>
        <p className="text-sm text-slate-400 mt-1">Generate and export reports</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportOptions.map((report, index) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${
                  report.id === 'users' ? 'bg-blue-500/10' :
                  report.id === 'payments' || report.id === 'revenue' ? 'bg-emerald-500/10' :
                  report.id === 'submissions' ? 'bg-purple-500/10' :
                  'bg-amber-500/10'
                } rounded-lg`}>
                  <Icon className={`w-6 h-6 ${
                    report.id === 'users' ? 'text-blue-400' :
                    report.id === 'payments' || report.id === 'revenue' ? 'text-emerald-400' :
                    report.id === 'submissions' ? 'text-purple-400' :
                    'text-amber-400'
                  }`} />
                </div>
                <span className="text-xs px-2 py-1 bg-white/5 rounded text-slate-400 uppercase">
                  {report.format}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-1">{report.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{report.description}</p>
              
              <button
                onClick={() => handleExport(report.id)}
                disabled={exporting}
                className="w-full px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {exporting && selectedReport === report.id ? 'Exporting...' : 'Export'}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

