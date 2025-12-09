'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Plus, X, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Reference {
  id: string
  title: string
  author?: string
  year?: string
  url?: string
}

interface ContentEditorProps {
  assignmentType: 'individual' | 'group'
  content: string
  references: Reference[]
  onChange: (content: string, references: Reference[]) => void
}

export function ContentEditor({ assignmentType, content, references, onChange }: ContentEditorProps) {
  const [topic, setTopic] = useState('')
  const [wordCount, setWordCount] = useState(1000)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newReference, setNewReference] = useState<Partial<Reference>>({})

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or question')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/assignment/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, wordCount, assignmentType }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate content')
      }

      const data = await response.json()
      onChange(data.content, data.references || [])
      toast.success('Content generated successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const addReference = () => {
    if (!newReference.title) {
      toast.error('Please enter at least a title')
      return
    }
    const ref: Reference = {
      id: Date.now().toString(),
      title: newReference.title,
      author: newReference.author,
      year: newReference.year,
      url: newReference.url,
    }
    onChange(content, [...references, ref])
    setNewReference({})
  }

  const removeReference = (id: string) => {
    onChange(content, references.filter(r => r.id !== id))
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-3">Assignment Content</h2>
        <p className="text-slate-400 mb-6">
          Generate content using AI or write manually
        </p>
      </div>

      {/* AI Generation Section */}
      <div className="bg-white/5 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Content Generation
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Topic or Question
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your assignment topic or question..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Word Count
            </label>
            <input
              type="number"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value) || 1000)}
              min={500}
              max={5000}
              step={100}
              className="w-full px-4 py-3 bg-white/5 border border-dashboard-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <motion.button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Content
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Manual Content Editor */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Assignment Content
        </label>
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value, references)}
          placeholder="Write or paste your assignment content here..."
          rows={12}
          className="w-full px-4 py-3 bg-white/5 border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-mono text-sm"
        />
        <p className="text-xs text-slate-500 mt-2">
          Word count: {content.split(/\s+/).filter(Boolean).length}
        </p>
      </div>

      {/* References Section */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          References
        </h3>
        <div className="space-y-3 mb-4">
          {references.map((ref) => (
            <div key={ref.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
              <div className="flex-1">
                <p className="text-white font-medium">{ref.title}</p>
                {ref.author && <p className="text-sm text-slate-400">{ref.author} {ref.year && `(${ref.year})`}</p>}
                {ref.url && <p className="text-xs text-slate-500 truncate">{ref.url}</p>}
              </div>
              <button
                onClick={() => removeReference(ref.id)}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Title"
            value={newReference.title || ''}
            onChange={(e) => setNewReference({ ...newReference, title: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <input
            type="text"
            placeholder="Author"
            value={newReference.author || ''}
            onChange={(e) => setNewReference({ ...newReference, author: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <input
            type="text"
            placeholder="Year"
            value={newReference.year || ''}
            onChange={(e) => setNewReference({ ...newReference, year: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <input
            type="url"
            placeholder="URL (optional)"
            value={newReference.url || ''}
            onChange={(e) => setNewReference({ ...newReference, url: e.target.value })}
            className="px-4 py-2 bg-white/5 border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
        <button
          onClick={addReference}
          className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Reference
        </button>
      </div>
    </div>
  )
}

