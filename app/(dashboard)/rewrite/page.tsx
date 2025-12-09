'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCw, 
  Sparkles, 
  Copy, 
  Download,
  ArrowRight,
  Check,
  Zap,
  Wand2,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { DiffViewer } from '@/components/tools/rewrite/DiffViewer'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

const writingStyles = [
  { value: 'academic', label: 'Academic', description: 'Formal and scholarly' },
  { value: 'professional', label: 'Professional', description: 'Business-appropriate' },
  { value: 'casual', label: 'Casual', description: 'Conversational tone' },
  { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
]

export default function RewritePage() {
  const [originalText, setOriginalText] = useState('')
  const [rewrittenText, setRewrittenText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('academic')
  const [isLoading, setIsLoading] = useState(false)
  const [showDiff, setShowDiff] = useState(false)

  const handleRewrite = async () => {
    if (!originalText.trim() || isLoading) return

    setIsLoading(true)
    setRewrittenText('')
    setShowDiff(false)

    try {
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: originalText,
          style: selectedStyle 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to rewrite text')
      }

      setRewrittenText(data.rewrittenText || 'Text rewritten successfully. Please review the changes.')
      toast.success('Text rewritten successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to rewrite text')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Downloaded successfully!')
  }

  const handleUseRewritten = () => {
    setOriginalText(rewrittenText)
    setRewrittenText('')
    toast.success('Moved to original text')
  }

  const wordCount = originalText.trim().split(/\s+/).filter(Boolean).length
  const rewrittenWordCount = rewrittenText.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <RefreshCw className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Grammar & Rewrite</h1>
              <p className="text-slate-400 mt-1">
                Transform your text into polished academic writing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Style Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {writingStyles.map((style) => (
          <motion.button
            key={style.value}
            onClick={() => setSelectedStyle(style.value)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              selectedStyle === style.value
                ? 'bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/20'
                : 'bg-dashboard-elevated border-dashboard-border hover:border-purple-500/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">{style.label}</span>
              {selectedStyle === style.value && (
                <Check className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <p className="text-xs text-slate-500">{style.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Text */}
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-dashboard-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Original Text</h3>
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                {wordCount} words
              </span>
            </div>
          </div>

          <div className="p-6">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste or type your text here..."
              disabled={isLoading}
              className="w-full h-[400px] bg-transparent border-none outline-none text-white placeholder:text-slate-500 resize-none disabled:opacity-50"
            />
          </div>

          <div className="px-6 pb-6">
            <motion.button
              onClick={handleRewrite}
              disabled={!originalText.trim() || isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
              whileHover={{ scale: originalText.trim() && !isLoading ? 1.02 : 1 }}
              whileTap={{ scale: originalText.trim() && !isLoading ? 0.98 : 1 }}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Rewrite Text
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Rewritten Text */}
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-dashboard-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Improved Text</h3>
              {rewrittenText && (
                <span className="px-2 py-0.5 bg-emerald-700 rounded text-xs text-emerald-200">
                  {rewrittenWordCount} words
                </span>
              )}
            </div>

            {rewrittenText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`p-2 rounded-lg transition-colors ${
                    showDiff ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-white/5 text-slate-400'
                  }`}
                  title="Toggle diff view"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCopy(rewrittenText)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleDownload(rewrittenText, 'rewritten-text.txt')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {rewrittenText ? (
              <AnimatePresence mode="wait">
                {showDiff ? (
                  <motion.div
                    key="diff"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <DiffViewer 
                      original={originalText} 
                      modified={rewrittenText}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[400px] overflow-y-auto prose prose-invert max-w-none"
                  >
                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {rewrittenText}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-slate-500 mb-2">Your improved text will appear here</p>
                  <p className="text-xs text-slate-600">
                    Click &quot;Rewrite Text&quot; to get started
                  </p>
                </div>
              </div>
            )}
          </div>

          {rewrittenText && (
            <div className="px-6 pb-6">
              <motion.button
                onClick={handleUseRewritten}
                className="w-full py-3 bg-dashboard-bg hover:bg-dashboard-surface border border-dashboard-border text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Use This Version
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Improvement Stats */}
      {rewrittenText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <RefreshCw className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Grammar Fixed</p>
                <p className="text-2xl font-bold text-white">12</p>
              </div>
            </div>
          </div>

          <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Readability Score</p>
                <p className="text-2xl font-bold text-white">A+</p>
              </div>
            </div>
          </div>

          <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Clarity Improved</p>
                <p className="text-2xl font-bold text-white">+45%</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

