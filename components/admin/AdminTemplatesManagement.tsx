'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Building2, Grid, List } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Template {
  id: string;
  college_name: string;
  college_code: string;
  template_type: 'individual' | 'group';
  citation_style: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminTemplatesManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/templates', {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setTemplates(result.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch('/api/admin/templates', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id: templateId, is_active: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      
      toast.success(`Template ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.college_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.college_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || template.template_type === filterType;
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && template.is_active) ||
      (filterActive === 'inactive' && !template.is_active);
    
    return matchesSearch && matchesType && matchesActive;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Templates Management</h2>
          <p className="text-sm text-slate-400 mt-1">Manage assignment templates for different colleges</p>
        </div>
        <button className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
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

          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
          <div className="text-sm text-slate-400">Total Templates</div>
          <div className="text-2xl font-bold text-white mt-1">{templates.length}</div>
        </div>
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
          <div className="text-sm text-slate-400">Active</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {templates.filter(t => t.is_active).length}
          </div>
        </div>
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
          <div className="text-sm text-slate-400">Individual</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">
            {templates.filter(t => t.template_type === 'individual').length}
          </div>
        </div>
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
          <div className="text-sm text-slate-400">Group</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {templates.filter(t => t.template_type === 'group').length}
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
            <p className="text-slate-400 mt-4">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No templates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dashboard-surface/50 border-b border-dashboard-border">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">College</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Citation</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template, index) => (
                  <motion.tr
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dashboard-border hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <div>
                          <div className="text-white font-medium">{template.college_name}</div>
                          <div className="text-xs text-slate-500">{template.college_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        template.template_type === 'individual'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {template.template_type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-300">{template.citation_style}</span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleTemplateStatus(template.id, template.is_active)}
                        className="flex items-center gap-2 text-sm"
                      >
                        {template.is_active ? (
                          <>
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5 text-slate-500" />
                            <span className="text-slate-500">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-slate-400 hover:text-amber-400" />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
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

