'use client'

import { motion } from 'framer-motion'
import { Info, Lightbulb, Zap, Shield, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const features = [
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description: 'Get instant results with our AI-powered tools. No more waiting hours for research or citations.',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We never share your assignments or personal information.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Lightbulb,
      title: 'AI-Powered',
      description: 'Leveraging cutting-edge AI technology to provide accurate, high-quality academic assistance.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      title: 'Student-Focused',
      description: 'Built specifically for Tanzanian college students, understanding your unique needs and challenges.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: TrendingUp,
      title: 'Affordable',
      description: 'Access professional-grade tools at a fraction of the cost of traditional tutoring services.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Info,
      title: 'Comprehensive',
      description: 'Everything you need in one platform: research, citations, grammar, plagiarism checking, and more.',
      color: 'from-orange-500 to-red-500'
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
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Info className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              About Us
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            AI Assignment Helper is your trusted partner in academic success. We&apos;re here to help 
            you excel in your studies with powerful, easy-to-use AI tools.
          </p>
        </motion.div>

        {/* What We Do */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">What We Do</h2>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                AI Assignment Helper provides a comprehensive suite of AI-powered tools designed 
                specifically for college students. Whether you need help with research, writing, 
                citations, grammar checking, or creating presentations, we&apos;ve got you covered.
              </p>
              <p>
                Our platform combines the power of advanced AI models with an intuitive interface, 
                making it easy for students to get professional-quality assistance without the 
                complexity or high costs of traditional services.
              </p>
              <p>
                We understand that every student&apos;s needs are different. That&apos;s why we offer flexible 
                credit-based pricing, allowing you to pay only for what you use. No subscriptions, 
                no hidden fees—just straightforward, affordable academic assistance.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Why Choose Us */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Why Choose Us</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">🎯 Built for Students</h3>
                <p className="text-slate-300 leading-relaxed">
                  Every feature is designed with students in mind. We understand your deadlines, 
                  your budget constraints, and your need for quality results.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">⚡ Lightning Fast</h3>
                <p className="text-slate-300 leading-relaxed">
                  Get results in seconds, not hours. Our AI tools process your requests instantly, 
                  so you can focus on learning instead of waiting.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">💰 Affordable Pricing</h3>
                <p className="text-slate-300 leading-relaxed">
                  Pay only for what you use with our credit-based system. No monthly subscriptions 
                  or hidden fees. Perfect for students on a budget.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">🔒 Privacy First</h3>
                <p className="text-slate-300 leading-relaxed">
                  Your assignments and data are encrypted and secure. We never share your work 
                  with third parties or use it for training without your consent.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">🌍 Made in Tanzania</h3>
                <p className="text-slate-300 leading-relaxed">
                  We&apos;re a local company that understands the Tanzanian academic system and the 
                  unique challenges you face. We&apos;re here to support you.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Join thousands of students who are already using AI Assignment Helper to improve their grades and save time.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Free Account
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

