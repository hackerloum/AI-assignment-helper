'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Star, Trash2, Upload } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CustomTemplate {
  id: string
  template_name: string
  college_name: string | null
  assignment_type: 'individual' | 'group'
  is_favorite: boolean
  usage_count: number
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CustomTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error: any) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (templateId: string, currentValue: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('custom_templates')
        .update({ is_favorite: !currentValue })
        .eq('id', templateId)

      if (error) throw error
      loadTemplates()
    } catch (error: any) {
      toast.error('Failed to update template')
    }
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
      toast.success('Template deleted')
      loadTemplates()
    } catch (error: any) {
      toast.error('Failed to delete template')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assignment">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Custom Templates</h1>
            <p className="text-slate-400">Manage your custom assignment templates</p>
          </div>
        </div>
        <Link href="/assignment/new?method=sample">
          <motion.button
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-5 h-5" />
            Upload New Template
          </motion.button>
        </Link>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Custom Templates</h3>
          <p className="text-slate-400 mb-6">Upload a sample assignment to create your first custom template</p>
          <Link href="/assignment/new?method=sample">
            <motion.button
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Upload Template
            </motion.button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(template.id, template.is_favorite)}
                    className={`p-2 rounded-lg transition-colors ${
                      template.is_favorite
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${template.is_favorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 bg-white/5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{template.template_name}</h3>
              <div className="space-y-2 text-sm text-slate-400">
                {template.college_name && <p>College: {template.college_name}</p>}
                <p>Type: {template.assignment_type}</p>
                <p>Used: {template.usage_count} times</p>
                <p className="text-xs text-slate-500">
                  Created: {new Date(template.created_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

