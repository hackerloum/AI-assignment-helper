'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileCode, 
  Book, 
  Globe, 
  FileText,
  Plus,
  Copy,
  Download,
  Trash2,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

type SourceType = 'book' | 'website' | 'journal' | 'other'

interface Source {
  id: string
  type: SourceType
  authors: string
  title: string
  year: string
  publisher?: string
  url?: string
  journal?: string
  volume?: string
  pages?: string
}

const sourceTypes = [
  { value: 'book', label: 'Book', icon: Book },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'journal', label: 'Journal Article', icon: FileText },
]

export default function ReferencingPage() {
  const [selectedType, setSelectedType] = useState<SourceType>('book')
  const [sources, setSources] = useState<Source[]>([])
  const [formData, setFormData] = useState({
    authors: '',
    title: '',
    year: '',
    publisher: '',
    url: '',
    journal: '',
    volume: '',
    pages: '',
  })

  const handleAddSource = () => {
    if (!formData.authors || !formData.title || !formData.year) {
      toast.error('Please fill in required fields')
      return
    }

    const newSource: Source = {
      id: Date.now().toString(),
      type: selectedType,
      ...formData,
    }

    setSources([...sources, newSource])
    
    // Reset form
    setFormData({
      authors: '',
      title: '',
      year: '',
      publisher: '',
      url: '',
      journal: '',
      volume: '',
      pages: '',
    })

    toast.success('Source added to bibliography')
  }

  const handleRemoveSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id))
    toast.success('Source removed')
  }

  const generateCitation = (source: Source, style: 'inline' | 'reference') => {
    // Simplified APA citation generation
    const authors = source.authors
    const year = source.year
    
    if (style === 'inline') {
      return `(${authors}, ${year})`
    }

    // Reference list format
    let citation = `${authors} (${year}). ${source.title}.`

    if (source.type === 'book' && source.publisher) {
      citation += ` ${source.publisher}.`
    } else if (source.type === 'journal' && source.journal) {
      citation += ` ${source.journal}`
      if (source.volume) citation += `, ${source.volume}`
      if (source.pages) citation += `, ${source.pages}`
      citation += '.'
    } else if (source.type === 'website' && source.url) {
      citation += ` Retrieved from ${source.url}`
    }

    return citation
  }

  const handleCopyBibliography = () => {
    const bibliography = sources
      .map(source => generateCitation(source, 'reference'))
      .join('\n\n')
    
    navigator.clipboard.writeText(bibliography)
    toast.success('Bibliography copied to clipboard!')
  }

  const handleDownload = () => {
    const bibliography = sources
      .map(source => generateCitation(source, 'reference'))
      .join('\n\n')
    
    const blob = new Blob([`References\n\n${bibliography}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'references.txt'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Downloaded successfully!')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <FileCode className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">APA Referencing</h1>
              <p className="text-slate-400 mt-1">
                Generate perfect APA 7th edition citations
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Source Type Selection */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Source Type</h3>
            <div className="grid grid-cols-3 gap-3">
              {sourceTypes.map((type) => {
                const Icon = type.icon
                return (
                  <motion.button
                    key={type.value}
                    onClick={() => setSelectedType(type.value as SourceType)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedType === type.value
                        ? 'bg-amber-500/10 border-amber-500'
                        : 'bg-dashboard-bg border-dashboard-border hover:border-amber-500/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      selectedType === type.value ? 'text-amber-400' : 'text-slate-400'
                    }`} />
                    <p className={`text-sm font-medium ${
                      selectedType === type.value ? 'text-white' : 'text-slate-400'
                    }`}>
                      {type.label}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">Source Details</h3>
            <div className="space-y-4">
              {/* Authors */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Author(s) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  placeholder="Smith, J., & Johnson, M."
                  className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="The complete guide to research"
                  className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Year <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                  maxLength={4}
                  className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>

              {/* Conditional Fields */}
              {selectedType === 'book' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Oxford University Press"
                    className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              )}

              {selectedType === 'website' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/article"
                    className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              )}

              {selectedType === 'journal' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Journal Name
                    </label>
                    <input
                      type="text"
                      value={formData.journal}
                      onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                      placeholder="Journal of Research"
                      className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Volume
                      </label>
                      <input
                        type="text"
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        placeholder="15"
                        className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Pages
                      </label>
                      <input
                        type="text"
                        value={formData.pages}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        placeholder="123-145"
                        className="w-full px-4 py-2.5 bg-white/5 border border-dashboard-border focus:border-amber-500 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <motion.button
              onClick={handleAddSource}
              className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Add to Bibliography
            </motion.button>
          </div>
        </div>

        {/* Bibliography Section */}
        <div className="space-y-6">
          {/* Bibliography List */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">
                Bibliography ({sources.length})
              </h3>
              {sources.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyBibliography}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Copy all"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {sources.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileCode className="w-6 h-6 text-amber-400" />
                </div>
                <p className="text-sm text-slate-400">
                  No sources added yet
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {sources.map((source, index) => (
                  <motion.div
                    key={source.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-dashboard-bg rounded-xl group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-semibold">
                            {source.type}
                          </span>
                          <span className="text-xs text-slate-600">#{index + 1}</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {generateCitation(source, 'reference')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveSource(source.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generateCitation(source, 'inline'))
                          toast.success('In-text citation copied!')
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Copy in-text
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generateCitation(source, 'reference'))
                          toast.success('Reference copied!')
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Copy reference
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Guide */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4">APA Format Guide</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-400">
                  <span className="text-white font-medium">Authors:</span> Last name, First initial.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-400">
                  <span className="text-white font-medium">Multiple authors:</span> Use & before last author
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-400">
                  <span className="text-white font-medium">Title:</span> Sentence case, italicized
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-400">
                  <span className="text-white font-medium">In-text:</span> (Author, Year)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

