'use client'

import { motion } from 'framer-motion'
import { BookOpen, Search, FileText, Video, Download, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      articles: [
        { title: 'Creating Your Account', slug: 'creating-account' },
        { title: 'Purchasing Credits', slug: 'purchasing-credits' },
        { title: 'Your First Assignment', slug: 'first-assignment' },
        { title: 'Understanding Credits', slug: 'understanding-credits' },
      ]
    },
    {
      id: 'tools',
      title: 'Using Our Tools',
      icon: Video,
      color: 'from-emerald-500 to-teal-500',
      articles: [
        { title: 'AI Research Assistant', slug: 'research-tool' },
        { title: 'Grammar Checker', slug: 'grammar-checker' },
        { title: 'Plagiarism Checker', slug: 'plagiarism-checker' },
        { title: 'APA Citation Generator', slug: 'citation-generator' },
        { title: 'PowerPoint Maker', slug: 'powerpoint-maker' },
      ]
    },
    {
      id: 'account',
      title: 'Account & Billing',
      icon: Download,
      color: 'from-amber-500 to-orange-500',
      articles: [
        { title: 'Managing Your Account', slug: 'managing-account' },
        { title: 'Payment Methods', slug: 'payment-methods' },
        { title: 'Subscription Plans', slug: 'subscription-plans' },
        { title: 'Refund Requests', slug: 'refund-requests' },
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: Search,
      color: 'from-purple-500 to-indigo-500',
      articles: [
        { title: 'Common Issues', slug: 'common-issues' },
        { title: 'Error Messages', slug: 'error-messages' },
        { title: 'Browser Compatibility', slug: 'browser-compatibility' },
        { title: 'Performance Tips', slug: 'performance-tips' },
      ]
    },
  ]

  const popularArticles = [
    { title: 'How to Use AI Research Assistant', category: 'tools', slug: 'research-tool' },
    { title: 'Understanding Credit System', category: 'account', slug: 'understanding-credits' },
    { title: 'Creating Your First Assignment', category: 'getting-started', slug: 'first-assignment' },
    { title: 'Payment Methods Explained', category: 'account', slug: 'payment-methods' },
    { title: 'Troubleshooting Common Issues', category: 'troubleshooting', slug: 'common-issues' },
  ]

  return (
    <div className="container mx-auto px-6 lg:px-12 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Help Center
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions and learn how to get the most out of AI Assignment Helper.
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
              placeholder="Search help articles..."
              className="w-full pl-12 pr-4 py-4 bg-dashboard-elevated border border-dashboard-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Popular Articles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/help/${article.slug}`}>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6 hover:border-amber-500/50 transition-colors cursor-pointer h-full">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-2">{article.title}</h3>
                        <p className="text-sm text-slate-400 capitalize">{article.category.replace('-', ' ')}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Categories */}
        <div className="space-y-8">
          {categories.map((category, categoryIndex) => {
            const Icon = category.icon
            const isExpanded = selectedCategory === category.id
            return (
              <motion.section
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setSelectedCategory(isExpanded ? null : category.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-white">{category.title}</h2>
                        <p className="text-sm text-slate-400">{category.articles.length} articles</p>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-dashboard-border"
                    >
                      <div className="p-6 space-y-3">
                        {category.articles.map((article, articleIndex) => (
                          <Link
                            key={articleIndex}
                            href={`/help/${article.slug}`}
                            className="block p-4 bg-dashboard-bg border border-dashboard-border rounded-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300 hover:text-white transition-colors">
                                {article.title}
                              </span>
                              <ArrowRight className="w-4 h-4 text-amber-400" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.section>
            )
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-8 text-center mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h3>
          <p className="text-slate-300 mb-6">
            Our support team is here to help. Get in touch and we&apos;ll assist you personally.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact">
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Support
              </motion.button>
            </Link>
            <Link href="/guide">
              <motion.button
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Student Guide
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

