'use client'

import { motion } from 'framer-motion'
import { CreditCard, Check, Zap, Crown, Infinity } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: '0',
    currency: 'TZS',
    period: 'forever',
    icon: Zap,
    color: 'from-slate-500 to-slate-600',
    features: [
      '3 free actions per day',
      'Access to all AI features',
      'Basic support',
      'No credit card required',
      'No time limit',
    ],
    current: true,
    href: '/dashboard',
  },
  {
    id: 'daily',
    name: 'Daily Pass',
    price: '500',
    currency: 'TZS',
    period: 'per day',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Unlimited tool access for 24 hours',
      'All AI features included',
      'No commitment required',
      'Pay with mobile money',
      'Instant activation',
      'Priority support',
    ],
    current: false,
    popular: false,
    href: '/purchase',
  },
  {
    id: 'monthly',
    name: 'Monthly Pass',
    price: '5,000',
    currency: 'TZS',
    period: 'per month',
    icon: Infinity,
    color: 'from-blue-600 to-purple-600',
    features: [
      'Everything in Daily Pass',
      'Unlimited access for 30 days',
      'Priority support',
      'Usage analytics',
      'Save 67% vs daily',
      'Cancel anytime',
      'Early access to new features',
    ],
    current: false,
    popular: true,
    href: '/purchase',
  },
]

export default function SubscriptionPage() {
  const { user } = useUser()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'monthly' | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: '',
      })
    }

    // Show success message if payment was successful
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        toast.success('Payment completed successfully! Your pass is now active.')
        // Clean up URL
        window.history.replaceState({}, '', '/subscription')
      }
    }
  }, [user])

  const handlePurchase = (planType: 'daily' | 'monthly') => {
    setSelectedPlan(planType)
    setDialogOpen(true)
  }

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return

    // Check if user is logged in client-side first
    if (!user) {
      toast.error('You must be logged in to purchase. Please refresh the page and try again.')
      setLoading(null)
      setDialogOpen(false)
      return
    }

    setLoading(selectedPlan)

    // Validate form data
    if (!formData.email || !formData.name || !formData.phone) {
      toast.error('Please fill in all required fields')
      setLoading(null)
      return
    }

    // Validate phone number format (Tanzanian: 07XXXXXXXX)
    const phoneRegex = /^07\d{8}$/
    const cleanedPhone = formData.phone.replace(/\s+/g, '')
    if (!phoneRegex.test(cleanedPhone)) {
      toast.error('Invalid phone number. Please use format: 07XXXXXXXX')
      setLoading(null)
      return
    }

    try {
      console.log('Initiating payment for user:', user.email)
      
      // Use API route instead of server action for better cookie handling in production
      const response = await fetch('/api/subscription/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          buyerEmail: formData.email,
          buyerName: formData.name,
          buyerPhone: cleanedPhone,
        }),
      })

      const result = await response.json()
      console.log('Payment result:', result)

      if (result.success) {
        if (result.paymentUrl) {
          toast.success('Payment initiated successfully!')
          setDialogOpen(false)
          window.location.href = result.paymentUrl
        } else {
          toast.success('Payment initiated successfully!')
          setDialogOpen(false)
        }
      } else {
        console.error('Payment failed:', result.error)
        toast.error(result.error || 'Failed to initiate payment')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <CreditCard className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-lg text-slate-400">
          Unlock unlimited access to all AI-powered academic tools
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const Icon = plan.icon
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-dashboard-elevated border ${
                plan.popular ? 'border-amber-500' : 'border-dashboard-border'
              } rounded-2xl p-6 ${plan.popular && 'ring-2 ring-amber-500/20'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <div className={`inline-flex p-3 bg-gradient-to-br ${plan.color} rounded-xl mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-xl text-slate-400">{plan.currency}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{plan.period}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => !plan.current && handlePurchase(plan.id as 'daily' | 'monthly')}
                disabled={plan.current || loading !== null}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${
                  plan.current
                    ? 'bg-white/10 text-white cursor-default'
                    : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`
                }`}
                whileHover={plan.current || loading ? {} : { scale: 1.02 }}
                whileTap={plan.current || loading ? {} : { scale: 0.98 }}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : plan.current ? (
                  'Current Plan'
                ) : plan.name === 'Daily Pass' ? (
                  'Get Daily Pass'
                ) : (
                  'Get Monthly Pass'
                )}
              </motion.button>
            </motion.div>
          )
        })}
      </div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
            <p className="text-slate-400">Yes, you can cancel your subscription at any time. No questions asked.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
            <p className="text-slate-400">We accept mobile money payments via ZenoPay (M-Pesa, Airtel Money, TigoPesa, and HaloPesa).</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
            <p className="text-slate-400">Yes, we offer a 100% satisfaction guarantee. If you&apos;re not happy with the results, contact us within 24 hours for a full refund.</p>
          </div>
        </div>
      </motion.div>

      {/* Payment Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment Details</DialogTitle>
            <DialogDescription>
              Please confirm your information to proceed with the payment via ZenoPay.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0744963858"
                required
              />
              <p className="text-xs text-slate-500">
                Format: 07XXXXXXXX (Tanzanian mobile number)
              </p>
            </div>
            {selectedPlan && (
              <div className="rounded-md bg-dashboard-bg p-3">
                <p className="text-sm font-medium text-white">
                  Plan: {plans.find(p => p.id === selectedPlan)?.name}
                </p>
                <p className="text-sm text-slate-400">
                  Amount: {plans.find(p => p.id === selectedPlan)?.price} {plans.find(p => p.id === selectedPlan)?.currency}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <button
              onClick={() => setDialogOpen(false)}
              disabled={loading !== null}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPurchase}
              disabled={loading !== null}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Pay'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

