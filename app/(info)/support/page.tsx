'use client'

import { motion } from 'framer-motion'
import { HelpCircle, MessageSquare, Book, Mail, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const supportOptions = [
    {
      icon: Book,
      title: 'Help Center',
      description: 'Browse our comprehensive knowledge base with articles, tutorials, and FAQs.',
      href: '/help',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: MessageSquare,
      title: 'Contact Support',
      description: 'Get in touch with our support team for personalized assistance.',
      href: '/contact',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24-48 hours.',
      href: 'mailto:support@aiassignmenthelper.com',
      color: 'from-amber-500 to-orange-500'
    },
  ]

  const quickLinks = [
    { label: 'Getting Started Guide', href: '/guide' },
    { label: 'Payment Methods', href: '/payments' },
    { label: 'Refund Policy', href: '/refunds' },
    { label: 'Account Settings', href: '/dashboard/settings' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ]

  const faqs = [
    {
      question: 'How do I get started?',
      answer: 'Simply create a free account, purchase credits, and start using our AI tools. Check out our Student Guide for detailed instructions.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept mobile money (M-Pesa, Airtel Money, TigoPesa) and other local payment methods. See our Payment Methods page for details.'
    },
    {
      question: 'How do credits work?',
      answer: 'Credits are used to access our AI tools. Different tools require different amounts of credits. You can purchase credits anytime and they never expire.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! We use industry-standard encryption and never share your assignments or personal information with third parties. See our Privacy Policy for details.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'Yes, we offer refunds for unused credits within 30 days of purchase. See our Refund Policy for complete details.'
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
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Support Center
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We&apos;re here to help! Find answers to common questions or get in touch with our support team.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help articles..."
              className="w-full pl-12 pr-4 py-4 bg-dashboard-elevated border border-dashboard-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {supportOptions.map((option, index) => {
            const Icon = option.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={option.href}>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6 h-full hover:border-amber-500/50 transition-colors cursor-pointer">
                    <div className={`w-14 h-14 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{option.title}</h3>
                    <p className="text-slate-300 leading-relaxed">{option.description}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Quick Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="flex items-center gap-3 p-4 bg-dashboard-bg border border-dashboard-border rounded-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors"
                >
                  <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  <span className="text-slate-300 hover:text-white transition-colors">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-dashboard-border pb-6 last:border-0 last:pb-0"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 text-center mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Still Need Help?
          </h3>
          <p className="text-slate-300 mb-6">
            Can&apos;t find what you&apos;re looking for? Our support team is ready to assist you.
          </p>
          <Link href="/contact">
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Support
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

