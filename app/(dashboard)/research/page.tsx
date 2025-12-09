'use client'

import { motion } from 'framer-motion'
import { FileText, Sparkles, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ResearchPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const handleResearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a research question')
      return
    }

    setLoading(true)
    try {
      // TODO: Integrate with AI API
      await new Promise(resolve => setTimeout(resolve, 2000))
      setResult('Sample research result will appear here. This is a placeholder for the AI-generated research content.')
      toast.success('Research completed!')
    } catch (error) {
      toast.error('Failed to generate research')
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
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Research Assistant</h1>
        </div>
        <p className="text-slate-400">
          Get comprehensive, AI-powered answers to your research questions
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
          What would you like to research?
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your research question or topic..."
          className="w-full h-32 px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
        
        <motion.button
          onClick={handleResearch}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Start Research
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Research Results</h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300">{result}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

