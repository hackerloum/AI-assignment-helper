'use client'

import { motion } from 'framer-motion'
import { GraduationCap, CheckCircle, ArrowRight, BookOpen, CreditCard, Zap, Shield } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function StudentGuidePage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(0)

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up for free and get started in minutes',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      details: [
        'Click "Get Started" on the homepage',
        'Enter your email and create a password',
        'Verify your email address',
        'Complete your profile (optional)',
      ]
    },
    {
      number: 2,
      title: 'Purchase Credits',
      description: 'Buy credits to access our AI tools',
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-500',
      details: [
        'Go to the Purchase page or Dashboard',
        'Choose your credit package',
        'Select your payment method (M-Pesa, Airtel Money, etc.)',
        'Complete the payment',
        'Credits are added instantly to your account',
      ]
    },
    {
      number: 3,
      title: 'Choose Your Tool',
      description: 'Select the AI tool you need for your assignment',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      details: [
        'Browse available tools from the Dashboard',
        'Choose from: Research, Grammar Check, Plagiarism Check, Citations, PowerPoint',
        'Each tool shows the credit cost before use',
        'Click on the tool to get started',
      ]
    },
    {
      number: 4,
      title: 'Complete Your Assignment',
      description: 'Use the AI tool to get instant help',
      icon: CheckCircle,
      color: 'from-purple-500 to-indigo-500',
      details: [
        'Enter your assignment details or upload files',
        'Configure tool settings (if applicable)',
        'Click "Generate" or "Check"',
        'Review and download your results',
        'Edit and refine as needed',
      ]
    },
  ]

  const tips = [
    {
      icon: Shield,
      title: 'Save Credits',
      description: 'Plan your assignments and use credits efficiently. Check credit costs before using tools.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Use Templates',
      description: 'Take advantage of assignment templates to save time and ensure proper formatting.',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: BookOpen,
      title: 'Review Results',
      description: 'Always review AI-generated content and make it your own. Use it as a starting point, not the final product.',
      color: 'from-blue-500 to-cyan-500'
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
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <GraduationCap className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Student Guide
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know to get started with AI Assignment Helper and make the most of our tools.
          </p>
        </motion.div>

        {/* Quick Start Steps */}
        <div className="space-y-6 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isExpanded = expandedStep === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : index)}
                    className="w-full p-6 flex items-center gap-6 hover:bg-white/5 transition-colors"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-white">Step {step.number}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-slate-300">{step.description}</p>
                    </div>
                    <ArrowRight
                      className={`w-6 h-6 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-dashboard-border"
                    >
                      <div className="p-6">
                        <ul className="space-y-3">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-300 leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tips Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Pro Tips</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${tip.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{tip.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{tip.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Tools Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Available Tools</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🤖 AI Research Assistant</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Get comprehensive research on any topic. Perfect for essays, reports, and research papers.
                </p>
                <p className="text-sm text-slate-400">Cost: 5-10 credits per research</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">✍️ Grammar & Rewrite Tool</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Improve your writing with AI-powered grammar checking and rewriting suggestions.
                </p>
                <p className="text-sm text-slate-400">Cost: 2-5 credits per check</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🔍 Plagiarism Checker</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Ensure your work is original with our comprehensive plagiarism detection.
                </p>
                <p className="text-sm text-slate-400">Cost: 3-7 credits per check</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📚 APA Citation Generator</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Generate properly formatted APA citations instantly for your references.
                </p>
                <p className="text-sm text-slate-400">Cost: 1 credit per citation</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📊 PowerPoint Maker</h3>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Create professional presentations with AI-generated slides and content.
                </p>
                <p className="text-sm text-slate-400">Cost: 10-20 credits per presentation</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-slate-300 mb-6">
            Create your free account and start using our AI tools today.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Free Account
              </motion.button>
            </Link>
            <Link href="/help">
              <motion.button
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Visit Help Center
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

