'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export function AdminSettings() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('/cp/login');
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Access URL */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Admin Access URL</h2>
          <p className="text-sm text-slate-400">The URL for accessing the admin control panel</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 px-4 py-3 bg-white/5 border border-dashboard-border rounded-lg">
            <code className="text-white font-mono text-sm">/cp/login</code>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          This URL provides access to the admin control panel. Keep it secure and share only with authorized administrators.
        </p>
      </div>

      {/* Security Alert */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-400 mb-1">Security Notice</h3>
            <p className="text-sm text-slate-300">
              The admin control panel is accessible at <code className="px-1.5 py-0.5 bg-white/10 rounded text-amber-400">/cp/login</code> instead of the common <code className="px-1.5 py-0.5 bg-white/10 rounded text-amber-400">/admin</code> path to avoid obvious admin access points.
            </p>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Security Recommendations</h2>
        <div className="space-y-4">
          {[
            'Only grant admin access to trusted users',
            'Regularly review admin activity logs',
            'Use strong passwords for admin accounts',
            'Monitor failed login attempts',
            'Enable two-factor authentication when available',
            'Keep admin access URLs confidential',
          ].map((recommendation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white/5 border border-dashboard-border rounded-lg"
            >
              <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-slate-300">{recommendation}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">System Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-dashboard-border">
            <span className="text-sm text-slate-400">Control Panel Version</span>
            <span className="text-sm text-white font-mono">1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-dashboard-border">
            <span className="text-sm text-slate-400">Access Level</span>
            <span className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-semibold">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
