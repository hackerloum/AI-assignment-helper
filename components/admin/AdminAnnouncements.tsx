'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Plus, X, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  target_audience: 'all' | 'students' | 'admins';
  created_at: string;
  created_by: string;
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    target_audience: 'all' as 'all' | 'students' | 'admins',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/announcements', {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAnnouncements(result.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send announcement');
      }

      toast.success('Announcement sent successfully');
      setShowForm(false);
      setFormData({
        title: '',
        message: '',
        priority: 'medium',
        target_audience: 'all',
      });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Announcements</h2>
          <p className="text-sm text-slate-400 mt-1">Send broadcasts and announcements to users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Create Announcement</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
                className="w-full px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Announcement message"
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Target Audience</label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                  className="w-full px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSend}
              className="w-full px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Announcement
            </button>
          </div>
        </motion.div>
      )}

      {/* Announcements List */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            <p className="text-slate-400 mt-4">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No announcements yet</p>
          </div>
        ) : (
          <div className="divide-y divide-dashboard-border">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                      <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {announcement.target_audience}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{announcement.message}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(announcement.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

