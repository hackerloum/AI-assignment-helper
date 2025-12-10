'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Lock, Download, Copy, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const writingStyles = [
  { value: 'academic', label: 'Academic', description: 'Formal academic style' },
  { value: 'professional', label: 'Professional', description: 'Business professional' },
  { value: 'casual', label: 'Casual', description: 'Natural conversational' },
]

export default function PublicHumanizePage() {
  const searchParams = useSearchParams()
  const [originalText, setOriginalText] = useState('')
  const [humanizedResult, setHumanizedResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('academic')
  const [hasPaid, setHasPaid] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)

  // Check payment status on mount or when paymentId changes
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Check URL params first
      const unlockedParam = searchParams.get('unlocked')
      const paymentIdParam = searchParams.get('paymentId')

      if (unlockedParam === 'true' && paymentIdParam) {
        setPaymentId(paymentIdParam)
        setHasPaid(true)
        return
      }

      // If we have a paymentId, check if it's unlocked
      if (paymentId) {
        setCheckingPayment(true)
        try {
          const response = await fetch(`/api/payments/tool/unlock?paymentId=${paymentId}`)
          const data = await response.json()

          if (data.unlocked) {
            setHasPaid(true)
            toast.success('Content unlocked!')
          }
        } catch (error) {
          console.error('Error checking payment status:', error)
        } finally {
          setCheckingPayment(false)
        }
      }
    }

    checkPaymentStatus()
  }, [paymentId, searchParams])

  const handleHumanize = async () => {
    if (!originalText.trim() || isLoading) return

    setIsLoading(true)
    setHumanizedResult(null)
    setHasPaid(false)

    try {
      // Call public API endpoint (no auth required)
      const response = await fetch('/api/ai/humanize/public', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
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

      // Result is blurred until payment
      setHumanizedResult(data.result.humanized)
      setPaymentId(data.paymentId)
      setHasPaid(false) // Will be set to true after payment verification
      
      toast.success('Content humanized! Complete payment to view, copy, or download.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to humanize content')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!paymentId) return

    // Redirect to payment page
    window.location.href = `/pay-tool?tool=humanize&paymentId=${paymentId}&price=500`
  }

  const handleCopy = async () => {
    if (!humanizedResult || !hasPaid) {
      toast.error('Please complete payment to copy the content')
      return
    }

    try {
      await navigator.clipboard.writeText(humanizedResult)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleDownload = () => {
    if (!humanizedResult || !hasPaid) {
      toast.error('Please complete payment to download the content')
      return
    }

    const blob = new Blob([humanizedResult], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'humanized-content.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <span className="font-bold text-navy-950">Assignment Helper</span>
            </Link>
            <Link 
              href="/auth/signup"
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              Sign Up for Free
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-12">
        {/* Page Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Content Humanize Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-navy-950 mb-4">
            Transform AI Text into Human Writing
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Paste your AI-generated content and get natural, human-written text. 
            Preview is free, payment required to copy or download.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Input Section */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-navy-950 mb-4">Original Text</h2>
            
            {/* Style Selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Writing Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {writingStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStyle === style.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste your AI-generated content here..."
              className="w-full h-64 p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <motion.button
              onClick={handleHumanize}
              disabled={!originalText.trim() || isLoading}
              className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Humanizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Humanize Content
                </>
              )}
            </motion.button>

            <p className="text-xs text-slate-500 mt-3 text-center">
              Price: 500 TZS per humanization
            </p>
          </motion.div>

          {/* Output Section */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-navy-950">Humanized Text</h2>
              {humanizedResult && (
                <div className="flex gap-2">
                  <motion.button
                    onClick={handleCopy}
                    disabled={!hasPaid}
                    className={`p-2 rounded-lg transition-all ${
                      hasPaid 
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    whileHover={hasPaid ? { scale: 1.1 } : {}}
                    title={hasPaid ? 'Copy' : 'Payment required'}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={handleDownload}
                    disabled={!hasPaid}
                    className={`p-2 rounded-lg transition-all ${
                      hasPaid 
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    whileHover={hasPaid ? { scale: 1.1 } : {}}
                    title={hasPaid ? 'Download' : 'Payment required'}
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                </div>
              )}
            </div>

            {humanizedResult ? (
              <div className="relative">
                {/* Blur overlay if not paid */}
                {!hasPaid && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <Lock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600 font-semibold mb-2">
                        Payment Required
                      </p>
                      <p className="text-sm text-slate-500 mb-4">
                        Complete payment to view, copy, or download the humanized content
                      </p>
                      <motion.button
                        onClick={handlePayment}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Pay 500 TZS to Unlock
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Blurred/Unblurred content */}
                <div
                  className={`p-4 border border-slate-300 rounded-lg min-h-[300px] bg-slate-50 ${
                    !hasPaid ? 'blur-sm select-none' : ''
                  }`}
                  style={{
                    filter: !hasPaid ? 'blur(8px)' : 'none',
                    userSelect: !hasPaid ? 'none' : 'auto',
                  }}
                >
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {humanizedResult}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg min-h-[300px] flex items-center justify-center">
                <p className="text-slate-400 text-center">
                  Your humanized content will appear here
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info Banner */}
        <motion.div
          className="mt-8 bg-blue-50 rounded-2xl p-6 border border-blue-100 max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-navy-950 mb-2">How It Works</h3>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• Paste your AI-generated text and click &quot;Humanize&quot;</li>
                <li>• Preview the result (blurred until payment)</li>
                <li>• Pay 500 TZS via mobile money to unlock</li>
                <li>• Copy, download, or use the content freely</li>
                <li>• No account required - use instantly!</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

