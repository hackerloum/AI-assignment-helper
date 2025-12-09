'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'Every account gets 3 free actions per day, forever. No credit card required. You can use any of our five AI tools—research, rewriting, plagiarism check, citations, or presentations. The limit resets every 24 hours.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major Tanzanian mobile money services including M-Pesa, Airtel Money, TigoPesa, and HaloPesa. Payment is instant and your account is activated immediately after confirmation.'
    },
    {
      question: 'Is the content plagiarism-free?',
      answer: 'Yes! All AI-generated content is original and unique. We also provide a built-in plagiarism checker so you can verify originality before submitting your work. However, we always recommend reviewing and personalizing AI output.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Absolutely! There are no long-term contracts. Daily passes expire after 24 hours. Monthly subscriptions can be canceled at any time, and you&apos;ll retain access until the end of your billing period.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 100% satisfaction guarantee. If you&apos;re not happy with the results within 24 hours of purchase, contact our support team for a full refund—no questions asked.'
    },
    {
      question: 'How accurate is the APA referencing?',
      answer: 'Our APA citation generator follows the latest APA 7th edition guidelines and is regularly updated. It handles books, journals, websites, and more. However, we recommend double-checking citations for complex sources.'
    },
    {
      question: 'Can multiple people use one account?',
      answer: 'Each account is for individual use only. Account sharing violates our terms of service and may result in suspension. We offer student discounts for group purchases—contact us for details.'
    },
    {
      question: 'What languages do you support?',
      answer: 'Currently, we support English and Swahili. Our AI understands both languages and can help with assignments in either language. We\'re working on adding more languages based on student demand.'
    }
  ]

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Header */}
          <motion.div
            className="lg:sticky lg:top-24"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <span className="text-sm font-semibold text-purple-700">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-950 mb-6 leading-tight">
              Questions?{' '}
              <span className="text-purple-600">We&apos;ve got answers</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
              Everything you need to know about AI Assignment Helper. 
              Can&apos;t find what you&apos;re looking for? Contact our support team.
            </p>
            <motion.a
              href="mailto:support@aiassignmenthelper.com"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              whileHover={{ x: 5 }}
            >
              Contact Support →
            </motion.a>
          </motion.div>

          {/* Right Column - FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-slate-100 transition-colors"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-navy-950 text-lg">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </motion.div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

