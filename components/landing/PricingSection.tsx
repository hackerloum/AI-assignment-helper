'use client'

import { motion } from 'framer-motion'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export function PricingSection() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const plans = [
    {
      id: 'pay-per-use',
      name: 'Pay Per Use',
      price: '200',
      period: 'per tool',
      description: 'Use tools without signing up',
      features: [
        'No account required',
        'Pay only for what you use',
        'Instant access after payment',
        'Mobile money payment',
        'Free tools available',
        'No commitment'
      ],
      cta: 'Try Tools Now',
      popular: false,
      gradient: 'from-slate-900 to-slate-800',
      href: '#quick-tools'
    },
    {
      id: 'daily',
      name: 'Daily Pass',
      price: '500',
      period: 'per day',
      description: 'Perfect for occasional assignments',
      features: [
        'Unlimited tool access for 24 hours',
        'All AI features included',
        'No commitment required',
        'Pay with mobile money',
        'Instant activation',
        'Priority support'
      ],
      cta: 'Get Daily Pass',
      popular: false,
      gradient: 'from-blue-600 to-cyan-600',
      href: '/purchase'
    },
    {
      id: 'monthly',
      name: 'Monthly Subscription',
      price: '5,000',
      period: 'per month',
      description: 'Best value for regular students',
      features: [
        'Unlimited access for 30 days',
        'All premium features',
        'Usage analytics',
        'Priority support',
        'Save 67% vs daily',
        'Cancel anytime',
        'Early access to new tools'
      ],
      cta: 'Subscribe Monthly',
      popular: true,
      gradient: 'from-emerald-600 to-teal-600',
      href: '/purchase'
    }
  ]

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
      <motion.div 
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Choose your{' '}
            <span className="text-amber-400">academic advantage</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
            Flexible pricing options. Use tools without signing up, or subscribe for unlimited access. 
            New users pay a one-time 3,000 TZS registration fee. All payments via mobile money.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredCard(plan.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-sm font-semibold text-white shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Card */}
              <motion.div
                className={`relative bg-white/5 backdrop-blur-xl rounded-3xl border ${
                  plan.popular ? 'border-amber-500/50' : 'border-white/10'
                } overflow-hidden h-full flex flex-col`}
                animate={{
                  borderColor: hoveredCard === plan.id 
                    ? (plan.popular ? 'rgba(245, 158, 11, 0.8)' : 'rgba(255, 255, 255, 0.3)')
                    : (plan.popular ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)')
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="p-8 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-xl text-slate-400">TZS</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{plan.period}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <div className={`w-5 h-5 rounded-full ${
                          plan.popular ? 'bg-amber-500' : 'bg-emerald-500'
                        } flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-slate-300 text-sm leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href={plan.href}>
                    <motion.button
                      className={`w-full py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>

                {/* Decorative gradient */}
                <div className={`h-1 bg-gradient-to-r ${plan.gradient} opacity-50`} />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Payment methods */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-slate-400 mb-6">Accepted payment methods:</p>
          <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
            {['M-Pesa', 'Airtel Money', 'TigoPesa', 'HaloPesa'].map((method) => (
              <motion.div 
                key={method} 
                className="px-6 py-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.3)' }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-white font-semibold">{method}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Registration Fee Info */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-2">New User Registration</h3>
            <p className="text-slate-300 text-sm mb-3">
              First-time users pay a one-time registration fee of <span className="font-bold text-amber-400">3,000 TZS</span> to access the dashboard and all features.
            </p>
            <p className="text-slate-400 text-xs">
              This is a one-time payment, not a subscription. After registration, you can use pay-per-use or subscribe to monthly plans.
            </p>
          </div>
        </motion.div>

        {/* Money-back guarantee */}
        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-slate-400 text-sm">
            <span className="text-emerald-400 font-semibold">100% Satisfaction Guaranteed</span> - If you&apos;re not happy with the results, contact us within 24 hours for a full refund.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

