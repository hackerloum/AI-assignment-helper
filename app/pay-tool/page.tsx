'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { validateTanzanianPhone, formatTanzanianPhone } from '@/lib/zenopay'

const toolNames: Record<string, string> = {
  humanize: 'Content Humanize',
  essay: 'Essay Writer',
  paraphrase: 'Paraphrase Tool',
  citation: 'APA Citations',
  summarize: 'Text Summarizer',
  grammar: 'Grammar Checker'
}

const toolPrices: Record<string, number> = {
  humanize: 500,
  essay: 300,
  paraphrase: 200,
  citation: 150,
  summarize: 250,
  grammar: 0
}

export default function PayToolPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paymentId = searchParams.get('paymentId')
  const tool = searchParams.get('tool')
  const price = searchParams.get('price') ? parseInt(searchParams.get('price')!) : null

  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle')
  const [checkingStatus, setCheckingStatus] = useState(false)

  const toolName = tool ? toolNames[tool] || 'Tool' : 'Tool'
  const toolPrice = price || (tool ? toolPrices[tool] : 0)

  useEffect(() => {
    if (!paymentId || !tool) {
      toast.error('Invalid payment request')
      router.push('/')
      return
    }

    if (toolPrice === 0) {
      toast.error('This tool is free and does not require payment')
      router.push(`/tools/${tool}`)
      return
    }
  }, [paymentId, tool, toolPrice, router])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateTanzanianPhone(buyerPhone)) {
      toast.error('Please enter a valid Tanzanian phone number (07XXXXXXXX)')
      return
    }

    if (!buyerEmail || !buyerName) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      const formattedPhone = formatTanzanianPhone(buyerPhone)

      const response = await fetch('/api/payments/tool/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          tool,
          amount: toolPrice,
          buyerEmail,
          buyerName,
          buyerPhone: formattedPhone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment')
      }

      // Payment initiated successfully
      // Start polling for payment status
      setPaymentStatus('processing')
      pollPaymentStatus(paymentId)
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Failed to process payment')
      setPaymentStatus('failed')
      setIsProcessing(false)
    }
  }

  const pollPaymentStatus = async (orderId: string) => {
    setCheckingStatus(true)
    let attempts = 0
    const maxAttempts = 60 // Check for 5 minutes (5 second intervals)

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/tool/verify?paymentId=${orderId}`)
        const data = await response.json()

        if (data.status === 'completed') {
          setPaymentStatus('success')
          setCheckingStatus(false)
          toast.success('Payment successful! Content unlocked.')
          
          // Redirect back to tool page with payment ID
          setTimeout(() => {
            router.push(`/tools/${tool}?paymentId=${orderId}&unlocked=true`)
          }, 2000)
          return
        } else if (data.status === 'failed') {
          setPaymentStatus('failed')
          setCheckingStatus(false)
          toast.error('Payment failed. Please try again.')
          setIsProcessing(false)
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000) // Check every 5 seconds
        } else {
          setCheckingStatus(false)
          setIsProcessing(false)
          toast.error('Payment verification timeout. Please check your payment status manually.')
        }
      } catch (error) {
        console.error('Status check error:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000)
        } else {
          setCheckingStatus(false)
          setIsProcessing(false)
        }
      }
    }

    checkStatus()
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-navy-950 mb-2">Payment Successful!</h2>
          <p className="text-slate-600 mb-6">
            Your payment has been confirmed. The content is now unlocked.
          </p>
          <Link
            href={`/tools/${tool}?paymentId=${paymentId}&unlocked=true`}
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Content
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 lg:px-12 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <span className="font-bold text-navy-950">Assignment Helper</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">Payment Required</span>
            </div>
            <h1 className="text-4xl font-bold text-navy-950 mb-4">
              Unlock {toolName}
            </h1>
            <p className="text-lg text-slate-600">
              Complete payment to view, copy, and download your content
            </p>
          </motion.div>

          {/* Payment Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Price Display */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-navy-950 mb-2">
                {toolPrice.toLocaleString()}
                <span className="text-2xl text-slate-500"> TZS</span>
              </div>
              <p className="text-slate-600">One-time payment for {toolName}</p>
            </div>

            {/* Payment Form */}
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number (M-Pesa/TigoPesa/AirtelMoney) *
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0712345678"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Format: 07XXXXXXXX (e.g., 0712345678)
                </p>
              </div>

              {paymentStatus === 'processing' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-semibold text-blue-900">Processing Payment...</p>
                      <p className="text-sm text-blue-700">
                        {checkingStatus 
                          ? 'Checking payment status...' 
                          : 'Please complete the payment on your phone'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">Payment Failed</p>
                      <p className="text-sm text-red-700">
                        Please check your payment details and try again
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={isProcessing || paymentStatus === 'processing'}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              >
                {isProcessing || paymentStatus === 'processing' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {toolPrice.toLocaleString()} TZS
                  </>
                )}
              </motion.button>
            </form>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 text-center mb-3">
                Accepted payment methods:
              </p>
              <div className="flex items-center justify-center gap-4">
                {['M-Pesa', 'TigoPesa', 'AirtelMoney'].map((method) => (
                  <div
                    key={method}
                    className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After clicking &quot;Pay&quot;, you&apos;ll receive a payment prompt on your phone. 
              Complete the payment to unlock your content. The page will automatically update when payment is confirmed.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

