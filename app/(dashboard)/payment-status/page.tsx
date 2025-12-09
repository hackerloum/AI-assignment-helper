'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Loader2, ArrowRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'checking'

export default function PaymentStatusPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, supabase } = useUser()
  const orderId = searchParams.get('order_id')
  const planType = searchParams.get('plan')
  
  const [status, setStatus] = useState<PaymentStatus>('checking')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [countdown, setCountdown] = useState(5)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!orderId) {
      toast.error('Invalid payment link')
      router.push('/subscription')
      return
    }

    // Check payment status immediately
    checkPaymentStatus()

    // Poll every 3 seconds for status updates (max 10 times = 30 seconds)
    let pollCount = 0
    const maxPolls = 10
    const pollInterval = setInterval(() => {
      pollCount++
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval)
        if (status === 'pending') {
          toast.info('Payment is taking longer than expected. Check back later.')
        }
        return
      }
      checkPaymentStatus()
    }, 3000)

    return () => clearInterval(pollInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // Countdown for redirect after success
  useEffect(() => {
    if (status === 'completed' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
    
    if (status === 'completed' && countdown === 0) {
      router.push('/subscription?success=true')
    }
  }, [status, countdown, router])

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/zenopay-callback?order_id=${orderId}`)
      const data = await response.json()

      if (response.ok) {
        setPaymentDetails(data)
        setStatus(data.status as PaymentStatus)
        
        if (data.status === 'completed') {
          toast.success('Payment completed successfully!')
        } else if (data.status === 'failed') {
          toast.error('Payment failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  const verifyPayment = async () => {
    if (!orderId || !user || !supabase) {
      toast.error('Unable to verify payment. Please refresh the page.')
      return
    }

    setVerifying(true)
    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setVerifying(false)
        return
      }

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ order_id: orderId }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('completed')
        setPaymentDetails(data.payment)
        toast.success('Payment verified successfully! Credits have been added to your account.')
        // Refresh credits on dashboard
        window.dispatchEvent(new Event('credits-updated'))
      } else {
        toast.error(data.error || 'Failed to verify payment')
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error)
      toast.error('An error occurred while verifying payment. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-20 h-20 text-green-400" />
      case 'failed':
        return <XCircle className="w-20 h-20 text-red-400" />
      case 'pending':
        return <Clock className="w-20 h-20 text-yellow-400 animate-pulse" />
      default:
        return <Loader2 className="w-20 h-20 text-blue-400 animate-spin" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'completed':
        return {
          title: 'Payment Successful!',
          description: 'Your subscription has been activated. You now have unlimited access!',
          color: 'green'
        }
      case 'failed':
        return {
          title: 'Payment Failed',
          description: 'The payment could not be completed. Please try again or contact support.',
          color: 'red'
        }
      case 'pending':
        return {
          title: 'Payment Pending',
          description: 'Please complete the payment on your mobile phone. We&apos;re waiting for confirmation...',
          color: 'yellow'
        }
      default:
        return {
          title: 'Checking Payment Status',
          description: 'Please wait while we verify your payment...',
          color: 'blue'
        }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Status Title */}
          <h1 className={`text-3xl font-bold text-${statusInfo.color}-400 mb-4`}>
            {statusInfo.title}
          </h1>

          {/* Status Description */}
          <p className="text-slate-400 mb-6">
            {statusInfo.description}
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-dashboard-bg rounded-xl p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="text-slate-300 font-mono text-xs">
                    {paymentDetails.order_id?.slice(0, 8)}...
                  </span>
                </div>
                {paymentDetails.transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction:</span>
                    <span className="text-slate-300 font-mono text-xs">
                      {paymentDetails.transaction_id}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="text-slate-300 font-semibold">
                    {paymentDetails.amount?.toLocaleString()} TZS
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="text-slate-300 capitalize">
                    {planType || 'Subscription'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {status === 'completed' && (
              <>
                <p className="text-sm text-slate-500">
                  Redirecting in {countdown} seconds...
                </p>
                <Link
                  href="/subscription?success=true"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}

            {status === 'failed' && (
              <Link
                href="/subscription"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Try Again
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {status === 'pending' && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Waiting for confirmation...</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={checkPaymentStatus}
                    disabled={verifying}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-1" />
                    Refresh Status
                  </button>
                  <div className="pt-2 border-t border-dashboard-border">
                    <p className="text-xs text-slate-500 mb-3">
                      Already completed payment on your phone?
                    </p>
                    <button
                      onClick={verifyPayment}
                      disabled={verifying}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {verifying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          I&apos;ve Completed Payment - Verify Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact us via email or WhatsApp
          </p>
        </div>
      </motion.div>
    </div>
  )
}

