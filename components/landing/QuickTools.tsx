'use client'

import { motion } from 'framer-motion'
import { Sparkles, FileText, RefreshCw, Shield, FileCode, Presentation, Zap } from 'lucide-react'
import Link from 'next/link'

export function QuickTools() {
  const tools = [
    {
      icon: Sparkles,
      name: 'Content Humanize',
      description: 'Transform AI-generated text into natural, human-written content',
      href: '/tools/humanize',
      price: '500 TZS',
      requiresPayment: true,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FileText,
      name: 'Essay Writer',
      description: 'Generate well-structured academic essays instantly',
      href: '/tools/essay',
      price: '300 TZS',
      requiresPayment: true,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: RefreshCw,
      name: 'Paraphrase Tool',
      description: 'Rewrite text while maintaining original meaning',
      href: '/tools/paraphrase',
      price: '200 TZS',
      requiresPayment: true,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: Shield,
      name: 'Grammar Checker',
      description: 'Fix grammar, spelling, and punctuation errors',
      href: '/tools/grammar',
      price: 'Free',
      requiresPayment: false,
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: FileCode,
      name: 'APA Citations',
      description: 'Generate perfect APA citations instantly',
      href: '/tools/citation',
      price: '150 TZS',
      requiresPayment: true,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Presentation,
      name: 'Text Summarizer',
      description: 'Summarize long texts into key points',
      href: '/tools/summarize',
      price: '250 TZS',
      requiresPayment: true,
      color: 'from-rose-500 to-pink-500'
    }
  ]

  return (
    <section id="quick-tools" className="py-24 lg:py-32 bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Quick Tools</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-950 mb-6 leading-tight">
            Use our tools{' '}
            <span className="text-blue-600">without signing up</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Try our AI tools instantly. No account needed. Pay per use with mobile money. 
            Some tools are completely free!
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={tool.href}>
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Icon & Price Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tool.requiresPayment 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {tool.price}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-navy-950 mb-2">{tool.name}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">
                      {tool.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      <span>Try Now</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {/* Info Banner */}
        <motion.div 
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-navy-950 mb-2">How It Works</h4>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                Use any tool without creating an account. For paid tools, you&apos;ll see a preview of the result, 
                but it will be blurred until you complete payment. Free tools work immediately with full access.
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>✓ No signup required</li>
                <li>✓ Pay per use with mobile money</li>
                <li>✓ Instant results after payment</li>
                <li>✓ Some tools are completely free</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

