'use client'

import { motion } from 'framer-motion'
import { Shield, Sparkles, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function PlagiarismPage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number | null>(null)

  const handleCheck = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to check')
      return
    }

    setLoading(true)
    try {
      // TODO: Integrate with plagiarism API
      await new Promise(resolve => setTimeout(resolve, 2000))
      setResult(98) // Sample result
      toast.success('Plagiarism check completed!')
    } catch (error) {
      toast.error('Failed to check plagiarism')
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
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Plagiarism Checker</h1>
        </div>
        <p className="text-slate-400">
          Ensure your work is 100% original and properly cited
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Paste your document text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text..."
          className="w-full h-48 px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-500">
            {text.split(' ').filter(w => w).length} words
          </span>
          
          <motion.button
            onClick={handleCheck}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Check Plagiarism
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Results Section */}
      {result !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Originality Score</h2>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="16"
                  fill="none"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#10B981"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - result / 100) }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-emerald-400">{result}%</div>
                  <div className="text-sm text-slate-500 mt-1">Original</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-slate-300">
            Your content is {result}% original. {result >= 90 ? 'Excellent!' : 'Consider reviewing flagged sections.'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

