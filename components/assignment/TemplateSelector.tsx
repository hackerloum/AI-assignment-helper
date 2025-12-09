'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, FileText, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Template {
  id: string
  college_name: string
  college_code: string
  template_type: 'individual' | 'group'
  cover_page_format: any
  content_format: any
}

interface TemplateSelectorProps {
  assignmentType: 'individual' | 'group'
  selectedId: string | null
  onSelect: (templateId: string) => void
}

export function TemplateSelector({ assignmentType, selectedId, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [assignmentType])

  const loadTemplates = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('assignment_templates')
        .select('*')
        .eq('template_type', assignmentType)
        .eq('is_active', true)

      if (error) throw error
      setTemplates(data || [])
    } catch (error: any) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
        <p className="text-slate-400">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-3">Select College Template</h2>
      <p className="text-slate-400 mb-8">
        Choose a pre-built template for your institution
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = selectedId === template.id
          return (
            <motion.button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`relative bg-white/5 hover:bg-white/10 border-2 rounded-xl p-6 text-left transition-all ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-dashboard-border hover:border-indigo-500/30'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <FileText className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-1">{template.college_name}</h3>
              <p className="text-sm text-slate-400">Code: {template.college_code}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

