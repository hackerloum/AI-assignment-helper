'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Copy, 
  Download,
  ArrowRight,
  Check,
  Star,
  MessageSquare,
  Loader2,
  Wand2,
  TrendingUp
} from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { submitHumanizeFeedback } from '@/app/actions/ai-actions'

const writingStyles = [
  { value: 'academic', label: 'Academic', description: 'Formal and scholarly' },
  { value: 'professional', label: 'Professional', description: 'Business-appropriate' },
  { value: 'casual', label: 'Casual', description: 'Conversational tone' },
  { value: 'formal', label: 'Formal', description: 'Highly formal style' },
]

export default function HumanizePage() {
  const [originalText, setOriginalText] = useState('')
  const [humanizedResult, setHumanizedResult] = useState<any>(null)
  const [selectedStyle, setSelectedStyle] = useState<'academic' | 'professional' | 'casual' | 'formal'>('academic')
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackText, setFeedbackText] = useState('')
  const [improvementSuggestions, setImprovementSuggestions] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [assignmentId, setAssignmentId] = useState<string | null>(null)

  const handleHumanize = async () => {
    if (!originalText.trim() || isLoading) return

    setIsLoading(true)
    setHumanizedResult(null)
    setShowFeedback(false)
    setRating(0)
    setFeedbackText('')
    setImprovementSuggestions('')

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

      const response = await fetch('/api/ai/humanize', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          text: originalText,
          options: {
            style: selectedStyle,
            preserveMeaning: true,
            enhanceClarity: true,
            addVariation: true
          }
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to humanize content')
      }

      setHumanizedResult(data.result)
      setAssignmentId(data.assignmentId)
      setShowFeedback(true)
      toast.success('Content humanized successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to humanize content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!rating || !assignmentId) {
      toast.error('Please provide a rating')
      return
    }

    setIsSubmittingFeedback(true)
    try {
      const result = await submitHumanizeFeedback(
        assignmentId,
        originalText,
        humanizedResult?.humanized || '',
        rating,
        feedbackText || undefined,
        improvementSuggestions || undefined
      )

      if (result.success) {
        toast.success('Thank you for your feedback! This helps us improve.')
        setShowFeedback(false)
        setRating(0)
        setFeedbackText('')
        setImprovementSuggestions('')
      } else {
        toast.error(result.error || 'Failed to submit feedback')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit feedback')
    } finally {
      setIsSubmittingFeedback(false)
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

  const handleUseHumanized = () => {
    if (humanizedResult?.humanized) {
      setOriginalText(humanizedResult.humanized)
      setHumanizedResult(null)
      setShowFeedback(false)
      toast.success('Moved to original text')
    }
  }

  const wordCount = originalText.trim().split(/\s+/).filter(Boolean).length
  const humanizedWordCount = humanizedResult?.humanized?.trim().split(/\s+/).filter(Boolean).length || 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Content Humanizer</h1>
              <p className="text-slate-400 mt-1">
                Transform AI-generated text into natural, human-written content
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
            onClick={() => setSelectedStyle(style.value as any)}
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
              <h3 className="font-semibold text-white">AI-Generated Text</h3>
              <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                {wordCount} words
              </span>
            </div>
          </div>

          <div className="p-6">
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste AI-generated content here (from ChatGPT, Gemini, etc.)..."
              disabled={isLoading}
              className="w-full h-[400px] bg-transparent border-none outline-none text-white placeholder:text-slate-500 resize-none disabled:opacity-50"
            />
          </div>

          <div className="px-6 pb-6">
            <motion.button
              onClick={handleHumanize}
              disabled={!originalText.trim() || isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
              whileHover={{ scale: originalText.trim() && !isLoading ? 1.02 : 1 }}
              whileTap={{ scale: originalText.trim() && !isLoading ? 0.98 : 1 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Humanizing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Humanize Content
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Humanized Text */}
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-dashboard-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">Humanized Text</h3>
              {humanizedResult && (
                <span className="px-2 py-0.5 bg-emerald-700 rounded text-xs text-emerald-200">
                  {humanizedWordCount} words
                </span>
              )}
            </div>

            {humanizedResult && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(humanizedResult.humanized)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleDownload(humanizedResult.humanized, 'humanized-text.txt')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {humanizedResult ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[400px] overflow-y-auto prose prose-invert max-w-none"
              >
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {humanizedResult.humanized}
                </p>
              </motion.div>
            ) : (
              <div className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-slate-500 mb-2">Your humanized text will appear here</p>
                  <p className="text-xs text-slate-600">
                    Click &quot;Humanize Content&quot; to get started
                  </p>
                </div>
              </div>
            )}
          </div>

          {humanizedResult && (
            <div className="px-6 pb-6">
              <motion.button
                onClick={handleUseHumanized}
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

      {/* Improvements Display */}
      {humanizedResult?.improvements && humanizedResult.improvements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Improvements Made
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {humanizedResult.improvements.map((improvement: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-dashboard-bg rounded-xl">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Check className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white capitalize">
                    {improvement.type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{improvement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Feedback Form */}
      {showFeedback && humanizedResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Help Us Improve</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Your feedback helps us train the AI to be more precise at humanizing content. 
            Rate the quality and share any suggestions.
          </p>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              How would you rate this humanization?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-2">
              General Feedback (Optional)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts about the humanization..."
              className="w-full h-24 bg-dashboard-bg border border-dashboard-border rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Improvement Suggestions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Improvement Suggestions (Optional)
            </label>
            <textarea
              value={improvementSuggestions}
              onChange={(e) => setImprovementSuggestions(e.target.value)}
              placeholder="What could be improved? (e.g., 'More natural transitions', 'Better vocabulary variety')"
              className="w-full h-24 bg-dashboard-bg border border-dashboard-border rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleSubmitFeedback}
              disabled={!rating || isSubmittingFeedback}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: rating && !isSubmittingFeedback ? 1.02 : 1 }}
              whileTap={{ scale: rating && !isSubmittingFeedback ? 0.98 : 1 }}
            >
              {isSubmittingFeedback ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </motion.button>
            <button
              onClick={() => setShowFeedback(false)}
              className="px-6 py-3 bg-dashboard-bg hover:bg-dashboard-surface border border-dashboard-border text-white font-semibold rounded-xl transition-all"
            >
              Skip
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

