'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CreditCard, Phone, Mail, User, Loader2, ArrowRight, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { formatTanzanianPhone, validateTanzanianPhone } from '@/lib/zenopay'

export default function OneTimePaymentPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPaid, setHasPaid] = useState<boolean | null>(null)
  const [checkingPayment, setCheckingPayment] = useState(true)

  // Check if user has already paid
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('has_paid_one_time_fee')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking payment status:', error)
        } else if (data) {
          setHasPaid(data.has_paid_one_time_fee || false)
        } else {
          setHasPaid(false)
        }
      } catch (error) {
        console.error('Error:', error)
        setHasPaid(false)
      } finally {
        setCheckingPayment(false)
      }
    }

    if (user) {
      checkPaymentStatus()
    }
  }, [user, supabase])

  // Redirect if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login?redirect=/one-time-payment')
    }
  }, [user, userLoading, router])

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        buyerEmail: user.email || '',
        buyerName: user.user_metadata?.full_name || '',
      }))
    }
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.buyerName.trim()) {
      newErrors.buyerName = 'Full name is required'
    }

    if (!formData.buyerEmail.trim()) {
      newErrors.buyerEmail = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.buyerEmail)) {
      newErrors.buyerEmail = 'Please enter a valid email address'
    }

    if (!formData.buyerPhone.trim()) {
      newErrors.buyerPhone = 'Phone number is required'
    } else {
      const formatted = formatTanzanianPhone(formData.buyerPhone)
      if (!validateTanzanianPhone(formatted)) {
        newErrors.buyerPhone = 'Invalid phone number. Use format: 07XXXXXXXX'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    if (!user) {
      toast.error('Please log in to continue')
      router.push('/login')
      return
    }

    setIsSubmitting(true)

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/payments/one-time/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        toast.success('Payment initiated! Redirecting to payment verification...')
        router.push(data.paymentUrl)
      } else {
        toast.error(data.error || 'Failed to initiate payment. Please try again.')
        setIsSubmitting(false)
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error)
      toast.error('An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (userLoading || checkingPayment) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (hasPaid) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8 text-center">
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-green-400 mb-4">
              Payment Already Completed!
            </h1>
            <p className="text-slate-400 mb-6">
              You have already paid the one-time signup fee. You can now access the dashboard.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dashboard-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              One-Time Signup Payment
            </h1>
            <p className="text-slate-400 text-sm">
              Pay 3,000 TZS to access all features
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-dashboard-bg rounded-xl p-4 mb-6 border border-dashboard-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400">Amount:</span>
              <span className="text-2xl font-bold text-amber-400">3,000 TZS</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Shield className="w-4 h-4" />
              <span>Secure payment via mobile money</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.buyerName}
                onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.buyerName && (
                <p className="text-red-400 text-sm mt-1">{errors.buyerName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-medium">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.buyerEmail}
                onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="you@example.com"
              />
              {errors.buyerEmail && (
                <p className="text-red-400 text-sm mt-1">{errors.buyerEmail}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-medium">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.buyerPhone}
                onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="07XXXXXXXX"
              />
              {errors.buyerPhone && (
                <p className="text-red-400 text-sm mt-1">{errors.buyerPhone}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Format: 07XXXXXXXX (M-Pesa, TigoPesa, or Airtel Money)
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay 3,000 TZS
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Need help? Contact us via email or WhatsApp
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

