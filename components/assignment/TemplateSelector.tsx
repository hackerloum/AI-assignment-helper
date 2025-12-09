'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Eye, 
  Building2, 
  FileText,
  Search,
  Loader2,
  Star
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface Template {
  id: string
  college_name: string
  college_code: string
  template_type: 'individual' | 'group'
  preview_image?: string
  cover_page_format: any
  content_format: any
  is_favorite?: boolean
}

interface TemplateSelectorProps {
  assignmentType: 'individual' | 'group'
  selectedId: string | null
  onSelect: (templateId: string) => void
}

export function TemplateSelector({ 
  assignmentType, 
  selectedId, 
  onSelect 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [assignmentType])

  const fetchTemplates = async () => {
    setLoading(true)
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
      toast.error(error.message || 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.college_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group templates by college
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const key = template.college_code
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Select College Template
          </h2>
          <p className="text-slate-400">
            Choose the template for your college or university
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name or code..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {Object.keys(groupedTemplates).length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No templates found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTemplates).map(([collegeCode, collegeTemplates]) => (
              <div key={collegeCode}>
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {collegeTemplates[0].college_name}
                  </h3>
                  <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full">
                    {collegeCode}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {collegeTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedId === template.id}
                      onSelect={() => onSelect(template.id)}
                      onPreview={() => setPreviewTemplate(template)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={() => {
            onSelect(previewTemplate.id)
            setPreviewTemplate(null)
          }}
        />
      )}
    </>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: Template
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
}

function TemplateCard({ template, isSelected, onSelect, onPreview }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative bg-dashboard-bg border-2 rounded-xl p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'border-dashboard-border hover:border-indigo-500/30'
      }`}
      onClick={onSelect}
    >
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Preview Image */}
      <div className="aspect-[3/4] bg-white/5 rounded-lg mb-3 overflow-hidden relative group">
        {template.preview_image ? (
          <Image
            src={template.preview_image}
            alt={`${template.college_name} template`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="w-12 h-12 text-slate-600" />
          </div>
        )}

        {/* Preview Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Template Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            template.template_type === 'group'
              ? 'bg-purple-500/10 text-purple-400'
              : 'bg-blue-500/10 text-blue-400'
          }`}>
            {template.template_type}
          </span>
          {template.is_favorite && (
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          )}
        </div>
        <div className="text-sm text-slate-400">
          <p className="font-medium text-white mb-1">Format Details:</p>
          <ul className="space-y-1">
            <li>• Font: {template.content_format.font}</li>
            <li>• Size: {template.content_format.font_size}pt</li>
            <li>• Spacing: {template.content_format.line_spacing}</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

// Template Preview Modal
function TemplatePreviewModal({ 
  template, 
  onClose, 
  onSelect 
}: { 
  template: Template
  onClose: () => void
  onSelect: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dashboard-border">
          <div>
            <h3 className="text-xl font-bold text-white">{template.college_name}</h3>
            <p className="text-sm text-slate-400">{template.college_code} - {template.template_type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="text-slate-400 text-xl">×</span>
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cover Page Format */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Cover Page Format</h4>
              <div className="bg-white p-8 rounded-lg text-black">
                {template.cover_page_format.fields?.map((field: any, index: number) => (
                  <div key={index} className={`mb-3 text-${field.align || 'left'}`}>
                    {field.type === 'table' ? (
                      <div className="my-4">
                        <p className="font-bold mb-2">{field.label}</p>
                        <table className="w-full border border-gray-300">
                          <thead>
                            <tr>
                              {field.columns?.map((col: string, i: number) => (
                                <th key={i} className="border border-gray-300 p-2 bg-gray-100">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              {field.columns?.map((_: string, i: number) => (
                                <td key={i} className="border border-gray-300 p-2">
                                  Sample
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className={`${field.bold ? 'font-bold' : ''} ${field.underline ? 'underline' : ''}`}>
                        {field.label}: {field.value === 'placeholder' ? 'Sample Text' : field.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content Format */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Content Format</h4>
              <div className="space-y-3">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Font Family</p>
                  <p className="text-white font-medium">{template.content_format.font}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Font Size</p>
                  <p className="text-white font-medium">{template.content_format.font_size}pt</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Line Spacing</p>
                  <p className="text-white font-medium">{template.content_format.line_spacing}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-slate-400 mb-1">Margins</p>
                  <p className="text-white font-medium">
                    Top: {template.content_format.margins?.top}", 
                    Bottom: {template.content_format.margins?.bottom}", 
                    Left: {template.content_format.margins?.left}", 
                    Right: {template.content_format.margins?.right}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-dashboard-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSelect}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all"
          >
            Use This Template
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
