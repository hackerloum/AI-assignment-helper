'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, 
  Eye, 
  Building2, 
  FileText,
  Search,
  Loader2,
  Star,
  Download,
  Calendar,
  FileCheck,
  Sparkles,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface Template {
  id?: string
  code: string
  type: 'individual' | 'group'
  path?: string
  size?: number
  modified?: string
  preview_url?: string
  // Legacy fields from Supabase (for backward compatibility)
  college_name?: string
  college_code?: string
  template_type?: 'individual' | 'group'
  preview_image?: string
  cover_page_format?: any
  content_format?: any
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
      // First, try to fetch DOCX templates from the new API
      const response = await fetch('/api/assignment/templates/list')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.templates) {
          // Filter by assignment type and map to Template interface
          const docxTemplates: Template[] = data.templates
            .filter((t: any) => t.type === assignmentType)
            .map((t: any) => ({
              id: `${t.code}_${t.type}`,
              code: t.code,
              type: t.type,
              path: t.path,
              size: t.size,
              modified: t.modified,
              preview_url: t.preview_url,
              college_code: t.code,
              college_name: t.college_name || t.code,
              template_type: t.type,
            }))
          
          if (docxTemplates.length > 0) {
            setTemplates(docxTemplates)
            setLoading(false)
            return
          }
        }
      }
      
      // Fallback to Supabase templates (for backward compatibility)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('assignment_templates')
        .select('*')
        .eq('template_type', assignmentType)
        .eq('is_active', true)

      if (error) throw error
      
      // Map Supabase templates to Template interface
      const supabaseTemplates: Template[] = (data || []).map((t: any) => ({
        id: t.id,
        code: t.college_code,
        type: t.template_type,
        college_name: t.college_name,
        college_code: t.college_code,
        template_type: t.template_type,
        preview_image: t.preview_image,
        cover_page_format: t.cover_page_format,
        content_format: t.content_format,
        is_favorite: t.is_favorite,
      }))
      
      setTemplates(supabaseTemplates)
    } catch (error: any) {
      console.error('Error fetching templates:', error)
      toast.error(error.message || 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template =>
    (template.college_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (template.college_code?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    template.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group templates by college code
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const key = template.code || template.college_code || 'other'
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(template)
    return acc
  }, {} as Record<string, Template[]>)

  if (loading) {
    return (
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
          <p className="text-slate-400">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">
                Select College Template
              </h2>
              <p className="text-slate-400 mt-1">
                Choose a professional template for your {assignmentType} assignment
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by college name or code..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-lg"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {Object.keys(groupedTemplates).length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
            <p className="text-slate-400">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedTemplates).map(([collegeCode, collegeTemplates], groupIndex) => (
              <motion.div
                key={collegeCode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl">
                    <Building2 className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {collegeTemplates[0].college_name || collegeCode}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">
                      Professional {assignmentType} assignment templates
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold rounded-lg">
                    {collegeCode}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collegeTemplates.map((template, index) => (
                    <TemplateCard
                      key={template.id || `${template.code}_${template.type}`}
                      template={template}
                      isSelected={selectedId === (template.id || `${template.code}_${template.type}`)}
                      onSelect={() => onSelect(template.id || `${template.code}_${template.type}`)}
                      onPreview={() => setPreviewTemplate(template)}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <TemplatePreviewModal
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onSelect={() => {
              const templateId = previewTemplate.id || `${previewTemplate.code}_${previewTemplate.type || previewTemplate.template_type}`
              onSelect(templateId)
              setPreviewTemplate(null)
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Template Card Component
interface TemplateCardProps {
  template: Template
  isSelected: boolean
  onSelect: () => void
  onPreview: () => void
  index: number
}

function TemplateCard({ template, isSelected, onSelect, onPreview, index }: TemplateCardProps) {
  const isGroup = (template.type || template.template_type) === 'group'
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative group cursor-pointer ${
        isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-dashboard-bg' : ''
      }`}
      onClick={onSelect}
    >
      <div className={`relative h-full bg-gradient-to-br ${
        isSelected
          ? 'from-indigo-500/20 via-purple-500/10 to-transparent border-2 border-indigo-500'
          : isGroup
          ? 'from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20'
          : 'from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20'
      } rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10`}>
        {/* Selected Badge */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 z-10"
          >
            <Check className="w-6 h-6 text-white" />
          </motion.div>
        )}

        {/* Template Preview Area */}
        <div className="relative mb-6">
          <div className={`aspect-[4/5] rounded-xl overflow-hidden ${
            isGroup ? 'bg-gradient-to-br from-purple-900/30 to-purple-800/20' : 'bg-gradient-to-br from-blue-900/30 to-blue-800/20'
          } border border-white/10 relative group/preview`}>
            {template.preview_image ? (
              <Image
                src={template.preview_image}
                alt={`${template.college_name || template.code} template`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {/* Mock Document Preview */}
                <div className="w-full bg-white/10 rounded-lg p-4 space-y-3 backdrop-blur-sm">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <div className={`h-2 rounded-full ${isGroup ? 'bg-purple-400/50' : 'bg-blue-400/50'} w-3/4 mx-auto`} />
                    <div className={`h-1.5 rounded-full ${isGroup ? 'bg-purple-400/30' : 'bg-blue-400/30'} w-1/2 mx-auto`} />
                  </div>
                  
                  {/* Content Lines */}
                  <div className="space-y-2 mt-4">
                    <div className={`h-1 rounded-full ${isGroup ? 'bg-purple-400/40' : 'bg-blue-400/40'} w-full`} />
                    <div className={`h-1 rounded-full ${isGroup ? 'bg-purple-400/40' : 'bg-blue-400/40'} w-5/6`} />
                    <div className={`h-1 rounded-full ${isGroup ? 'bg-purple-400/40' : 'bg-blue-400/40'} w-4/6`} />
                  </div>
                  
                  {/* Table Preview (for group) */}
                  {isGroup && (
                    <div className="mt-4 space-y-1">
                      <div className="flex gap-1">
                        <div className="flex-1 h-1.5 bg-purple-400/30 rounded" />
                        <div className="flex-1 h-1.5 bg-purple-400/30 rounded" />
                        <div className="flex-1 h-1.5 bg-purple-400/30 rounded" />
                      </div>
                      <div className="flex gap-1">
                        <div className="flex-1 h-1.5 bg-purple-400/20 rounded" />
                        <div className="flex-1 h-1.5 bg-purple-400/20 rounded" />
                        <div className="flex-1 h-1.5 bg-purple-400/20 rounded" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview()
                }}
                className="px-4 py-2 bg-white text-black rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transform translate-y-2 group-hover/preview:translate-y-0 transition-all"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
              isGroup
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {template.type || template.template_type}
            </span>
            {template.is_favorite && (
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-lg">
              {template.college_name || template.code} Template
            </h4>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              {template.size && (
                <div className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{(template.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
              {template.modified && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Updated</span>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ready to use DOCX template</span>
            </div>
          </div>
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
  const isGroup = (template.type || template.template_type) === 'group'
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${
          isGroup ? 'from-purple-500/20 to-purple-600/10' : 'from-blue-500/20 to-blue-600/10'
        } p-6 border-b border-dashboard-border`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  isGroup ? 'bg-purple-500/20' : 'bg-blue-500/20'
                }`}>
                  <Building2 className={`w-6 h-6 ${isGroup ? 'text-purple-400' : 'text-blue-400'}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {template.college_name || template.code}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {template.code} • {template.type || template.template_type} Assignment Template
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
          <div className="space-y-6">
            {/* Template Preview Card */}
            <div className={`bg-gradient-to-br ${
              isGroup ? 'from-purple-500/10 to-purple-600/5' : 'from-blue-500/10 to-blue-600/5'
            } border ${
              isGroup ? 'border-purple-500/20' : 'border-blue-500/20'
            } rounded-xl p-6`}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-xl ${
                  isGroup ? 'bg-purple-500/20' : 'bg-blue-500/20'
                }`}>
                  <FileText className={`w-8 h-8 ${isGroup ? 'text-purple-400' : 'text-blue-400'}`} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">DOCX Template</h4>
                  <p className="text-sm text-slate-400">Professional Word document template</p>
                </div>
              </div>
              
              {/* Template Structure Preview */}
              <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10">
                <h5 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Template Structure
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-slate-300">College logo and header</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-slate-300">Cover page with all required fields</span>
                  </div>
                  {isGroup && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-slate-300">Group members table</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-slate-300">Assignment content area</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-slate-300">References section</span>
                  </div>
                </div>
              </div>

              {/* Template Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Template Code</p>
                  <p className="text-white font-semibold">{template.code}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Type</p>
                  <p className="text-white font-semibold capitalize">{template.type || template.template_type}</p>
                </div>
                {template.size && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">File Size</p>
                    <p className="text-white font-semibold">{(template.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
                {template.modified && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Last Updated</p>
                    <p className="text-white font-semibold">
                      {new Date(template.modified).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              {template.preview_url && (
                <a
                  href={template.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/30"
                >
                  <Download className="w-5 h-5" />
                  Download Template Preview
                </a>
              )}
            </div>

            {/* Template Variables Info */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
              <h5 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Template Variables
              </h5>
              <p className="text-sm text-slate-300 mb-3">
                This template uses docxtemplater syntax. Variables will be automatically filled with your data:
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <code className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">{'{college_name}'}</code>
                  <span className="text-slate-400">College name</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <code className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">{'{student_name}'}</code>
                  <span className="text-slate-400">Student name</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <code className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">{'{module_code}'}</code>
                  <span className="text-slate-400">Module code</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <code className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">{'{assignment_content}'}</code>
                  <span className="text-slate-400">Content</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-dashboard-border bg-dashboard-bg/50">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSelect}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Use This Template
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
