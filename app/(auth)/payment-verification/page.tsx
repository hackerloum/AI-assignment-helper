'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, Loader2, ArrowRight, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'checking'

export default function PaymentVerificationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const supabase = createClient()
  const orderId = searchParams.get('order_id')
  const paymentType = searchParams.get('type')
  
  const [status, setStatus] = useState<PaymentStatus>('checking')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [countdown, setCountdown] = useState(5)
  const [verifying, setVerifying] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!orderId) {
      toast.error('Invalid payment link')
      router.push('/one-time-payment')
      return
    }

    // Check payment status immediately
    checkPaymentStatus()

    // Poll every 3 seconds for status updates (max 20 times = 60 seconds)
    let pollCount = 0
    const maxPolls = 20
    const pollInterval = setInterval(() => {
      pollCount++
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval)
        if (status === 'pending') {
          toast.info('Payment is taking longer than expected. You can verify manually below.')
        }
        return
      }
      checkPaymentStatus()
    }, 3000)

    return () => clearInterval(pollInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // Auto-redirect when payment is completed
  useEffect(() => {
    if (status === 'completed' && countdown > 0 && !redirecting) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
    
    if (status === 'completed' && countdown === 0 && !redirecting) {
      setRedirecting(true)
      console.log('[Payment Verification] Payment completed, redirecting to dashboard...')
      
      // Force trigger database update one more time
      fetch(`/api/payments/check-zenopay-status?order_id=${orderId}`)
        .then(() => {
          console.log('[Payment Verification] Status check triggered')
        })
        .catch(err => console.error('Status check error:', err))
      
      // Redirect immediately - don't wait for verification
      // The dashboard will check payment status and allow access if payment is completed
      toast.success('Redirecting to dashboard...')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    }
  }, [status, countdown, redirecting, orderId])

  const checkPaymentStatus = async () => {
    try {
      // Use the new endpoint that checks ZenoPay directly
      const response = await fetch(`/api/payments/check-zenopay-status?order_id=${orderId}`)
      const data = await response.json()

      if (response.ok) {
        setPaymentDetails(data)
        const paymentStatus = data.status as PaymentStatus
        setStatus(paymentStatus)
        
        if (paymentStatus === 'completed') {
          // Only show toast once and start countdown
          if (status !== 'completed') {
            toast.success('Payment completed successfully!')
            // Reset countdown to start the redirect timer
            setCountdown(5)
          }
        } else if (paymentStatus === 'failed') {
          toast.error('Payment failed. Please try again.')
        }
      } else {
        // If direct check fails, fallback to database check
        const fallbackResponse = await fetch(`/api/payments/zenopay-callback?order_id=${orderId}`)
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setPaymentDetails(fallbackData)
          setStatus(fallbackData.status as PaymentStatus)
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      // Fallback to database check on error
      try {
        const fallbackResponse = await fetch(`/api/payments/zenopay-callback?order_id=${orderId}`)
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          setPaymentDetails(fallbackData)
          setStatus(fallbackData.status as PaymentStatus)
        }
      } catch (fallbackError) {
        console.error('Fallback check also failed:', fallbackError)
      }
    }
  }

  const verifyPaymentStatus = async (): Promise<boolean> => {
    if (!orderId || !user || !supabase) {
      return false
    }

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.error('No session token available')
        return false
      }

      // First, trigger a status check to ensure database is updated
      const statusResponse = await fetch(`/api/payments/check-zenopay-status?order_id=${orderId}`)
      if (!statusResponse.ok) {
        console.error('Failed to check payment status')
        return false
      }

      const statusData = await statusResponse.json()
      if (statusData.status !== 'completed') {
        console.log('Payment status is not completed yet:', statusData.status)
        return false
      }

      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if user has been marked as paid
      const { data: userCredits, error } = await supabase
        .from('user_credits')
        .select('has_paid_one_time_fee')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user_credits:', error)
        // If record doesn't exist, it might be created by the status check
        // Wait and check again
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const { data: userCreditsRetry, error: retryError } = await supabase
          .from('user_credits')
          .select('has_paid_one_time_fee')
          .eq('user_id', user.id)
          .single()

        if (retryError) {
          console.error('Error on retry:', retryError)
          return false
        }

        return userCreditsRetry?.has_paid_one_time_fee || false
      }

      const hasPaid = userCredits?.has_paid_one_time_fee || false
      console.log('[Verify Payment] User payment status:', hasPaid)
      return hasPaid
    } catch (error: any) {
      console.error('Error verifying payment:', error)
      return false
    }
  }

  const handleManualVerify = async () => {
    if (!orderId || !user || !supabase) {
      toast.error('Unable to verify payment. Please refresh the page.')
      return
    }

    setVerifying(true)
    try {
      const isPaid = await verifyPaymentStatus()
      
      if (isPaid) {
        setStatus('completed')
        setPaymentDetails({ ...paymentDetails, status: 'completed' })
        toast.success('Payment verified successfully! Redirecting...')
        // Trigger redirect
        setCountdown(0)
      } else {
        toast.error('Payment not yet verified. Please complete the payment on your phone and try again.')
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
          description: 'Your one-time payment has been verified. You now have full access to the dashboard!',
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
          description: 'Please complete the payment on your mobile phone. We\'re waiting for confirmation...',
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
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-4">
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
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {status === 'completed' && (
              <>
                {!redirecting && (
                  <p className="text-sm text-slate-500">
                    Redirecting to dashboard in {countdown} seconds...
                  </p>
                )}
                {redirecting && (
                  <div className="flex items-center justify-center gap-2 text-green-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Verifying and redirecting...</span>
                  </div>
                )}
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all w-full justify-center"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {status === 'failed' && (
              <button
                onClick={() => router.push('/one-time-payment')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all w-full justify-center"
              >
                Try Again
                <ArrowRight className="w-4 h-4" />
              </button>
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
                      onClick={handleManualVerify}
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

