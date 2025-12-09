'use client'

import { motion } from 'framer-motion'
import { CreditCard, Smartphone, Wallet, Shield, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PaymentMethodsPage() {
  const paymentMethods = [
    {
      icon: Smartphone,
      title: 'M-Pesa',
      description: 'Pay instantly using your M-Pesa mobile money account',
      color: 'from-emerald-500 to-teal-500',
      steps: [
        'Select M-Pesa as your payment method',
        'Enter your M-Pesa phone number',
        'Confirm the payment amount',
        'Enter your M-Pesa PIN when prompted',
        'Payment is processed instantly',
      ]
    },
    {
      icon: Smartphone,
      title: 'Airtel Money',
      description: 'Use your Airtel Money account for quick payments',
      color: 'from-red-500 to-rose-500',
      steps: [
        'Select Airtel Money as your payment method',
        'Enter your Airtel Money phone number',
        'Confirm the payment amount',
        'Enter your Airtel Money PIN',
        'Payment is processed instantly',
      ]
    },
    {
      icon: Smartphone,
      title: 'TigoPesa',
      description: 'Pay securely with your TigoPesa account',
      color: 'from-blue-500 to-cyan-500',
      steps: [
        'Select TigoPesa as your payment method',
        'Enter your TigoPesa phone number',
        'Confirm the payment amount',
        'Enter your TigoPesa PIN',
        'Payment is processed instantly',
      ]
    },
    {
      icon: CreditCard,
      title: 'Credit/Debit Cards',
      description: 'Pay using Visa, Mastercard, or other major cards',
      color: 'from-purple-500 to-indigo-500',
      steps: [
        'Select Card as your payment method',
        'Enter your card details securely',
        'Confirm the payment amount',
        'Complete 3D Secure authentication if required',
        'Payment is processed securely',
      ]
    },
  ]

  const features = [
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'All payments are encrypted and processed through secure payment gateways',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: CheckCircle,
      title: 'Instant Processing',
      description: 'Credits are added to your account immediately after successful payment',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Wallet,
      title: 'No Hidden Fees',
      description: 'Pay only for the credits you purchase. No subscription fees or hidden charges',
      color: 'from-amber-500 to-orange-500'
    },
  ]

  const faqs = [
    {
      question: 'Is my payment information secure?',
      answer: 'Yes! We use industry-standard encryption and never store your full payment details. All transactions are processed through secure payment gateways.'
    },
    {
      question: 'How long does it take for credits to appear?',
      answer: 'Credits are added instantly after successful payment. If you don\'t see them, please contact support.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes, we offer refunds for unused credits within 30 days of purchase. See our Refund Policy for details.'
    },
    {
      question: 'What if my payment fails?',
      answer: 'If your payment fails, no charges will be made. Please check your payment method and try again, or contact support for assistance.'
    },
  ]

  return (
    <div className="container mx-auto px-6 lg:px-12 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <CreditCard className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Payment Methods
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Choose from multiple secure payment options. All payments are processed instantly and securely.
          </p>
        </motion.div>

        {/* Payment Methods */}
        <div className="space-y-6 mb-16">
          {paymentMethods.map((method, index) => {
            const Icon = method.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8"
              >
                <div className="flex items-start gap-6 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{method.title}</h2>
                    <p className="text-slate-300">{method.description}</p>
                  </div>
                </div>
                <div className="border-t border-dashboard-border pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">How to Pay:</h3>
                  <ol className="space-y-3">
                    {method.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-sm font-semibold">
                          {stepIndex + 1}
                        </span>
                        <span className="text-slate-300 leading-relaxed pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 text-center"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-dashboard-border pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Purchase Credits?
          </h3>
          <p className="text-slate-300 mb-6">
            Choose your payment method and get started with AI Assignment Helper today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/purchase">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Purchase Credits
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

