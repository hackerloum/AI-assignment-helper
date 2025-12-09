'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Presentation, 
  Sparkles, 
  ArrowRight,
  Loader2,
  Download,
  Check,
  FileText,
  Wand2
} from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

const presentationStyles = [
  { value: 'professional', label: 'Professional', description: 'Business-focused' },
  { value: 'creative', label: 'Creative', description: 'Visual and engaging' },
  { value: 'academic', label: 'Academic', description: 'Formal and scholarly' },
]

export default function PowerPointPage() {
  const [topic, setTopic] = useState('')
  const [slides, setSlides] = useState(5)
  const [selectedStyle, setSelectedStyle] = useState('professional')
  const [isLoading, setIsLoading] = useState(false)
  const [presentation, setPresentation] = useState<any>(null)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a presentation topic')
      return
    }

    setIsLoading(true)
    setPresentation(null)

    try {
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/ai/powerpoint', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          topic,
          slides,
          style: selectedStyle 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate presentation')
      }

      setPresentation(data)
      toast.success('Presentation generated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate presentation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!presentation) return

    const content = presentation.slides
      .map((slide: any, index: number) => 
        `Slide ${index + 1}: ${slide.title}\n${slide.content}\n`
      )
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `presentation-${Date.now()}.txt`
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
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <Presentation className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">PowerPoint Maker</h1>
              <p className="text-slate-400 mt-1">
                Create professional presentations in seconds with AI
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Topic Input */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Presentation Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Climate Change Impact on Agriculture"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white/5 border border-dashboard-border focus:border-pink-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 transition-all disabled:opacity-50"
            />
          </div>

          {/* Slides Count */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-300">
                Number of Slides
              </label>
              <span className="text-lg font-bold text-white">{slides}</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={slides}
              onChange={(e) => setSlides(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>3 slides</span>
              <span>15 slides</span>
            </div>
          </div>

          {/* Style Selection */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Presentation Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {presentationStyles.map((style) => (
                <motion.button
                  key={style.value}
                  onClick={() => setSelectedStyle(style.value)}
                  disabled={isLoading}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selectedStyle === style.value
                      ? 'bg-pink-500/10 border-pink-500 shadow-lg shadow-pink-500/20'
                      : 'bg-dashboard-bg border-dashboard-border hover:border-pink-500/30'
                  } disabled:opacity-50`}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    {selectedStyle === style.value && (
                      <Check className="w-5 h-5 text-pink-400" />
                    )}
                  </div>
                  <p className={`text-sm font-medium ${
                    selectedStyle === style.value ? 'text-white' : 'text-slate-400'
                  }`}>
                    {style.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{style.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            onClick={handleGenerate}
            disabled={!topic.trim() || isLoading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30"
            whileHover={{ scale: topic.trim() && !isLoading ? 1.02 : 1 }}
            whileTap={{ scale: topic.trim() && !isLoading ? 0.98 : 1 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Presentation
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          {presentation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Preview</h3>
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {presentation.slides?.map((slide: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-dashboard-bg rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs font-semibold">
                        Slide {index + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white mb-2">{slide.title || `Slide ${index + 1}`}</h4>
                    <p className="text-sm text-slate-400 line-clamp-3">
                      {slide.content || slide.text || 'Content will appear here'}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Presentation className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Ready to Generate</h3>
                <p className="text-sm text-slate-400">
                  Enter a topic and click &quot;Generate Presentation&quot; to create your slides
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

