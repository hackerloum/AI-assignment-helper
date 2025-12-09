'use client'

import { motion } from 'framer-motion'
import { RefreshCw, Sparkles, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function RewritePage() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleRewrite = async () => {
    if (!text.trim()) {
      toast.error('Please enter text to rewrite')
      return
    }

    setLoading(true)
    try {
      // TODO: Integrate with AI API
      await new Promise(resolve => setTimeout(resolve, 2000))
      setResult('Sample rewritten text will appear here. This is a placeholder for the AI-improved content.')
      toast.success('Text rewritten successfully!')
    } catch (error) {
      toast.error('Failed to rewrite text')
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
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <RefreshCw className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Grammar & Rewrite</h1>
        </div>
        <p className="text-slate-400">
          Transform your text into polished, professional academic writing
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
          Paste your text here
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text..."
          className="w-full h-48 px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-500">
            {text.length} characters
          </span>
          
          <motion.button
            onClick={handleRewrite}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Rewriting...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Improve Text
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Improved Text</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300">{result}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

