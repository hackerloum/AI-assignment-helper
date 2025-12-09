'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Upload,
  FileText,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { ProgressRing } from '@/components/ui/ProgressRing'

export default function PlagiarismPage() {
  const [text, setText] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<any>(null)

  const handleScan = async () => {
    if (!text.trim() || text.length < 50) {
      toast.error('Please enter at least 50 characters')
      return
    }

    setIsScanning(true)
    setScanResult(null)

    try {
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setIsScanning(false)
        return
      }

      const response = await fetch('/api/ai/plagiarism', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check plagiarism')
      }

      // Process results from API
      const similarityScore = data.similarityScore || 0
      setScanResult({
        similarityScore,
        isPlagiarized: similarityScore > 15,
        totalWords: text.split(/\s+/).length,
        uniquePercentage: 100 - similarityScore,
        sources: data.sources || [],
      })

      toast.success('Scan completed!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to check plagiarism')
    } finally {
      setIsScanning(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/plain') {
      toast.error('Please upload a .txt file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setText(content)
      toast.success('File loaded successfully')
    }
    reader.readAsText(file)
  }

  const getStatusColor = (score: number): { bg: 'emerald' | 'amber' | 'red'; text: string; icon: typeof CheckCircle } => {
    if (score < 15) return { bg: 'emerald', text: 'Original', icon: CheckCircle }
    if (score < 25) return { bg: 'amber', text: 'Moderate', icon: AlertTriangle }
    return { bg: 'red', text: 'High Risk', icon: AlertTriangle }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const status = scanResult ? getStatusColor(scanResult.similarityScore) : null

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb />
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Plagiarism Checker</h1>
              <p className="text-slate-400 mt-1">
                Ensure your work is 100% original
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Input */}
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-dashboard-border">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">Your Text</h3>
                <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                  {wordCount} words
                </span>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-3 py-1.5 bg-dashboard-bg hover:bg-dashboard-surface border border-dashboard-border rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload File
                </div>
              </label>
            </div>

            <div className="p-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text here to check for plagiarism..."
                disabled={isScanning}
                className="w-full h-[400px] bg-transparent border-none outline-none text-white placeholder:text-slate-500 resize-none disabled:opacity-50"
              />
            </div>

            <div className="px-6 pb-6">
              <motion.button
                onClick={handleScan}
                disabled={!text.trim() || wordCount < 50 || isScanning}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                whileHover={{ scale: text.trim() && wordCount >= 50 && !isScanning ? 1.02 : 1 }}
                whileTap={{ scale: text.trim() && wordCount >= 50 && !isScanning ? 0.98 : 1 }}
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Check Plagiarism
                  </>
                )}
              </motion.button>

              {wordCount > 0 && wordCount < 50 && (
                <p className="text-xs text-amber-400 mt-2 text-center">
                  Minimum 50 words required ({50 - wordCount} more needed)
                </p>
              )}
            </div>
          </div>

          {/* Sources Found */}
          {scanResult && scanResult.sources && scanResult.sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
            >
              <h3 className="font-semibold text-white mb-4">Similar Sources Found</h3>
              <div className="space-y-3">
                {scanResult.sources.map((source: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-dashboard-bg rounded-xl"
                  >
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <ExternalLink className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-white">{source.title || 'Source'}</h4>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-semibold whitespace-nowrap">
                          {source.similarity || source.similarityScore || 0}% match
                        </span>
                      </div>
                      {source.url && (
                        <a 
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-400 hover:text-blue-400 transition-colors break-all"
                        >
                          {source.url}
                        </a>
                      )}
                      {source.matches && (
                        <p className="text-xs text-slate-600 mt-1">
                          {source.matches} matching phrases found
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {scanResult ? (
            <>
              {/* Score Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white">Originality Score</h3>
                  {status && (
                    <status.icon className={`w-5 h-5 ${
                      status.bg === 'emerald' ? 'text-emerald-400' :
                      status.bg === 'amber' ? 'text-amber-400' :
                      'text-red-400'
                    }`} />
                  )}
                </div>

                <div className="flex items-center justify-center mb-6">
                  <ProgressRing
                    progress={scanResult.uniquePercentage}
                    size={140}
                    strokeWidth={12}
                    color={status?.bg as 'emerald' | 'amber' | 'red' || 'emerald'}
                  />
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {scanResult.uniquePercentage}%
                  </div>
                  {status && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                      status.bg === 'emerald' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                      status.bg === 'amber' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-red-500/10 border border-red-500/20'
                    }`}>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        status.bg === 'emerald' ? 'bg-emerald-400' :
                        status.bg === 'amber' ? 'bg-amber-400' :
                        'bg-red-400'
                      }`} />
                      <span className={`text-sm font-semibold ${
                        status.bg === 'emerald' ? 'text-emerald-400' :
                        status.bg === 'amber' ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {status.text}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-6 border-t border-dashboard-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Total Words</span>
                    <span className="font-semibold text-white">{scanResult.totalWords}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Similarity Found</span>
                    <span className={`font-semibold ${
                      !status || status.bg === 'emerald' ? 'text-emerald-400' :
                      status.bg === 'amber' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {scanResult.similarityScore}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Sources Checked</span>
                    <span className="font-semibold text-white">1,000+</span>
                  </div>
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
              >
                <h3 className="font-semibold text-white mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {scanResult.isPlagiarized ? (
                    <>
                      <div className="flex items-start gap-2 text-sm text-amber-400">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Review and paraphrase similar sections</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-amber-400">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Add proper citations for referenced work</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-amber-400">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Use quotation marks for direct quotes</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-2 text-sm text-emerald-400">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Your text appears to be original</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-emerald-400">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>No significant matches found</p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-emerald-400">
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>Safe to submit</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          ) : (
            <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Ready to Scan</h3>
                <p className="text-sm text-slate-400">
                  Enter your text and click &quot;Check Plagiarism&quot; to analyze
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

