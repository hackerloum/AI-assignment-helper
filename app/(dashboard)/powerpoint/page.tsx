'use client'

import { motion } from 'framer-motion'
import { Presentation, Sparkles, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function PowerPointPage() {
  const [topic, setTopic] = useState('')
  const [slides, setSlides] = useState(5)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a presentation topic')
      return
    }

    setLoading(true)
    try {
      // TODO: Integrate with AI API
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Presentation generated!')
    } catch (error) {
      toast.error('Failed to generate presentation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-pink-500/10 rounded-xl">
            <Presentation className="w-6 h-6 text-pink-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">PowerPoint Maker</h1>
        </div>
        <p className="text-slate-400">
          Create professional presentations in seconds with AI
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Presentation Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Climate Change Impact on Agriculture"
              className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Number of Slides: {slides}
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={slides}
              onChange={(e) => setSlides(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>3 slides</span>
              <span>15 slides</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Professional', 'Creative', 'Academic'].map((style) => (
                <button
                  key={style}
                  className="px-4 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-white hover:border-pink-500 transition-colors"
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Presentation
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  )
}

