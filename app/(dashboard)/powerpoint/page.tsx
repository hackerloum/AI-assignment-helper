'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Presentation, 
  ArrowRight,
  Loader2,
  Download,
  Check,
  FileText,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  Layout,
  Clock,
  FileDown,
  Copy
} from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

const presentationStyles = [
  { value: 'professional', label: 'Professional', description: 'Business-focused' },
  { value: 'creative', label: 'Creative', description: 'Visual and engaging' },
  { value: 'academic', label: 'Academic', description: 'Formal and scholarly' },
]

interface Slide {
  title: string
  content: string
  speakerNotes?: string
  visualSuggestions?: string[]
  layout?: string
  bulletPoints?: string[]
}

interface Presentation {
  title: string
  subtitle?: string
  slides: Slide[]
  theme?: string
  estimatedDuration?: number
}

export default function PowerPointPage() {
  const [topic, setTopic] = useState('')
  const [slides, setSlides] = useState(5)
  const [selectedStyle, setSelectedStyle] = useState('professional')
  const [isLoading, setIsLoading] = useState(false)
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a presentation topic')
      return
    }

    setIsLoading(true)
    setPresentation(null)
    setCurrentSlideIndex(0)

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
      toast.success('Presentation generated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate presentation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPowerPoint = async () => {
    if (!presentation) return

    setIsLoading(true)
    toast.loading('Generating PowerPoint file...')

    try {
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
          style: selectedStyle,
          downloadFile: true 
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate PowerPoint file')
      }

      // Download the file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pptx`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.dismiss()
      toast.success('PowerPoint file downloaded successfully!')
    } catch (error: any) {
      toast.dismiss()
      toast.error(error.message || 'Failed to generate PowerPoint file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = (format: 'text' | 'json' = 'text') => {
    if (!presentation) return

    let content = ''
    let filename = ''
    let mimeType = ''

    if (format === 'json') {
      content = JSON.stringify(presentation, null, 2)
      filename = `presentation-${Date.now()}.json`
      mimeType = 'application/json'
    } else {
      // Enhanced text format with all details
      content = `PRESENTATION: ${presentation.title}\n`
      if (presentation.subtitle) {
        content += `Subtitle: ${presentation.subtitle}\n`
      }
      if (presentation.estimatedDuration) {
        content += `Estimated Duration: ${presentation.estimatedDuration} minutes\n`
      }
      content += `\n${'='.repeat(50)}\n\n`

      presentation.slides.forEach((slide, index) => {
        content += `SLIDE ${index + 1}: ${slide.title}\n`
        content += `${'-'.repeat(50)}\n`
        
        if (slide.bulletPoints && slide.bulletPoints.length > 0) {
          slide.bulletPoints.forEach(point => {
            content += `• ${point}\n`
          })
        } else {
          content += `${slide.content}\n`
        }
        
        if (slide.speakerNotes) {
          content += `\nSpeaker Notes: ${slide.speakerNotes}\n`
        }
        
        if (slide.visualSuggestions && slide.visualSuggestions.length > 0) {
          content += `\nVisual Suggestions:\n`
          slide.visualSuggestions.forEach(suggestion => {
            content += `  - ${suggestion}\n`
          })
        }
        
        content += `\n${'='.repeat(50)}\n\n`
      })

      filename = `presentation-${Date.now()}.txt`
      mimeType = 'text/plain'
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success(`Downloaded as ${format.toUpperCase()}!`)
  }

  const copySlideContent = (slide: Slide) => {
    const content = slide.bulletPoints?.join('\n') || slide.content
    navigator.clipboard.writeText(content)
    toast.success('Slide content copied to clipboard!')
  }

  const currentSlide = presentation?.slides[currentSlideIndex]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
                Create professional presentations with AI-powered content generation
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
              max="20"
              value={slides}
              onChange={(e) => setSlides(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>3 slides</span>
              <span>20 slides</span>
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
                Generating Presentation...
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
            <>
              {/* Presentation Info */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{presentation.title}</h3>
                      {presentation.subtitle && (
                        <p className="text-sm text-slate-400 mt-1">{presentation.subtitle}</p>
                      )}
                    </div>
                  </div>

                  {/* Download PowerPoint Button */}
                  <motion.button
                    onClick={handleDownloadPowerPoint}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                    whileHover={{ scale: !isLoading ? 1.02 : 1 }}
                    whileTap={{ scale: !isLoading ? 0.98 : 1 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating .pptx file...
                      </>
                    ) : (
                      <>
                        <Presentation className="w-4 h-4" />
                        Download PowerPoint (.pptx)
                      </>
                    )}
                  </motion.button>

                  {/* Alternative Download Options */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload('text')}
                      className="flex-1 p-2 hover:bg-white/5 rounded-lg transition-colors text-xs text-slate-400 flex items-center justify-center gap-1"
                      title="Download as Text"
                    >
                      <FileDown className="w-3 h-3" />
                      Text
                    </button>
                    <button
                      onClick={() => handleDownload('json')}
                      className="flex-1 p-2 hover:bg-white/5 rounded-lg transition-colors text-xs text-slate-400 flex items-center justify-center gap-1"
                      title="Download as JSON"
                    >
                      <Download className="w-3 h-3" />
                      JSON
                    </button>
                  </div>
                </div>

                {presentation.estimatedDuration && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>~{presentation.estimatedDuration} minutes</span>
                  </div>
                )}
              </motion.div>

              {/* Slide Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">Slide Preview</h3>
                    <span className="text-xs text-slate-500">
                      {currentSlideIndex + 1} / {presentation.slides.length}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                      className={`p-2 rounded-lg transition-colors ${
                        showSpeakerNotes ? 'bg-pink-500/20 text-pink-400' : 'hover:bg-white/5 text-slate-400'
                      }`}
                      title="Toggle Speaker Notes"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => currentSlide && copySlideContent(currentSlide)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                      title="Copy Slide Content"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Slide Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-2 rounded-lg bg-dashboard-bg border border-dashboard-border hover:border-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                  <div className="flex gap-1">
                    {presentation.slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlideIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlideIndex
                            ? 'bg-pink-500 w-6'
                            : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === presentation.slides.length - 1}
                    className="p-2 rounded-lg bg-dashboard-bg border border-dashboard-border hover:border-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Current Slide Content */}
                {currentSlide && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlideIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-dashboard-bg rounded-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded text-xs font-semibold">
                            Slide {currentSlideIndex + 1}
                          </span>
                          {currentSlide.layout && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Layout className="w-3 h-3" />
                              {currentSlide.layout}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-white mb-3 text-lg">{currentSlide.title}</h4>
                        
                        {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 ? (
                          <ul className="space-y-2">
                            {currentSlide.bulletPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                <span className="text-pink-400 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-slate-300 whitespace-pre-line">{currentSlide.content}</p>
                        )}
                      </div>

                      {/* Speaker Notes */}
                      {showSpeakerNotes && currentSlide.speakerNotes && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <h5 className="text-sm font-semibold text-blue-400">Speaker Notes</h5>
                          </div>
                          <p className="text-sm text-slate-300">{currentSlide.speakerNotes}</p>
                        </motion.div>
                      )}

                      {/* Visual Suggestions */}
                      {currentSlide.visualSuggestions && currentSlide.visualSuggestions.length > 0 && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-purple-400" />
                            <h5 className="text-sm font-semibold text-purple-400">Visual Suggestions</h5>
                          </div>
                          <ul className="space-y-1">
                            {currentSlide.visualSuggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                <span className="text-purple-400 mt-1">→</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            </>
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
