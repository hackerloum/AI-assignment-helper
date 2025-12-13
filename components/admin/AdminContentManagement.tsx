'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Trash2, Eye, CheckCircle2, XCircle, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Assignment {
  id: string;
  user_id: string;
  user_email?: string;
  title: string;
  assignment_type: 'individual' | 'group';
  created_at: string;
  word_count: number;
}

export function AdminContentManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/content/assignments', {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAssignments(result.assignments || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
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
      
      const response = await fetch('/api/admin/content/assignments', {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ id: assignmentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      toast.success('Assignment deleted successfully');
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = searchTerm === '' || 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || assignment.assignment_type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Management</h2>
          <p className="text-sm text-slate-400 mt-1">Manage assignments and content</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="group">Group</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
          <div className="text-sm text-slate-400">Total Assignments</div>
          <div className="text-2xl font-bold text-white mt-1">{assignments.length}</div>
        </div>
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
          <div className="text-sm text-slate-400">Individual</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {assignments.filter(a => a.assignment_type === 'individual').length}
          </div>
        </div>
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
          <div className="text-sm text-slate-400">Group</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {assignments.filter(a => a.assignment_type === 'group').length}
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            <p className="text-slate-400 mt-4">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No assignments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dashboard-surface/50 border-b border-dashboard-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Title</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Words</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment, index) => (
                  <motion.tr
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dashboard-border hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="text-white font-medium">{assignment.title || 'Untitled'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-300">{assignment.user_email || 'Unknown'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        assignment.assignment_type === 'individual'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {assignment.assignment_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-300">{assignment.word_count || 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-400">
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-slate-400 hover:text-blue-400" />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                        </button>
                      </div>
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

