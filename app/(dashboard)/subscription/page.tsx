'use client'

import { motion } from 'framer-motion'
import { CreditCard, Check, Zap, Crown, Infinity } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    color: 'from-slate-500 to-slate-600',
    features: [
      '3 credits per day',
      'Basic AI tools',
      'Email support',
      'Community access',
    ],
    current: true,
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: 'per month',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'Unlimited credits',
      'All AI tools',
      'Priority support',
      'Advanced features',
      'Export options',
    ],
    current: false,
    popular: true,
  },
  {
    name: 'Pro',
    price: '$19.99',
    period: 'per month',
    icon: Infinity,
    color: 'from-purple-500 to-pink-500',
    features: [
      'Everything in Premium',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Team collaboration',
    ],
    current: false,
  },
]

export default function SubscriptionPage() {
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
                  <span className="text-slate-400">/{plan.period}</span>
                </div>
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
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.current
                    ? 'bg-white/10 text-white cursor-default'
                    : `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                }`}
                whileHover={plan.current ? {} : { scale: 1.02 }}
                whileTap={plan.current ? {} : { scale: 0.98 }}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade Now'}
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
            <p className="text-slate-400">We accept all major credit cards, PayPal, and cryptocurrency.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
            <p className="text-slate-400">Yes, we offer a 30-day money-back guarantee if you&apos;re not satisfied.</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

