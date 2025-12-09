'use client'

import { motion } from 'framer-motion'
import { RefreshCw, Clock, CheckCircle, XCircle, Mail, FileText } from 'lucide-react'
import Link from 'next/link'
import { LegalTOC } from '@/components/legal/LegalTOC'
import { LegalSection } from '@/components/legal/LegalSection'
import { useState, useEffect } from 'react'

const sections = [
  { id: 'overview', title: '1. Overview' },
  { id: 'eligibility', title: '2. Refund Eligibility' },
  { id: 'timeframe', title: '3. Refund Timeframe' },
  { id: 'process', title: '4. Refund Process' },
  { id: 'exceptions', title: '5. Exceptions & Limitations' },
  { id: 'contact', title: '6. Contact Us' },
]

export default function RefundPolicyPage() {
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id)
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="container mx-auto px-6 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Table of Contents - Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <LegalTOC
                sections={sections}
                activeSection={activeSection}
                onSectionClick={setActiveSection}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <RefreshCw className="w-8 h-8 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Refund Policy
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">Last updated: January 15, 2025</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed">
                  At AI Assignment Helper, we want you to be completely satisfied with our service. 
                  This Refund Policy explains when and how you can request a refund for purchased credits.
                </p>
              </div>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {/* 1. Overview */}
              <LegalSection
                id="overview"
                title="1. Overview"
                isActive={activeSection === 'overview'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  AI Assignment Helper operates on a credit-based system. Credits are purchased 
                  and used to access our AI-powered tools. This Refund Policy applies to all 
                  credit purchases made through our platform.
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We understand that circumstances may change, and you may need to request a refund. 
                  We are committed to processing refund requests fairly and promptly in accordance 
                  with this policy.
                </p>
                <div className="bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong>Important:</strong> Refunds are only available for unused credits. 
                    Credits that have been used to access our tools are non-refundable.
                  </p>
                </div>
              </LegalSection>

              {/* 2. Refund Eligibility */}
              <LegalSection
                id="eligibility"
                title="2. Refund Eligibility"
                isActive={activeSection === 'eligibility'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  You are eligible for a refund if you meet the following criteria:
                </p>
                <h4 className="text-lg font-semibold text-white mb-3">2.1 Unused Credits</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• You have unused credits in your account</li>
                  <li className="text-slate-300">• The credits were purchased within the last 30 days</li>
                  <li className="text-slate-300">• No credits from the purchase have been used</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">2.2 Partial Refunds</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  If you have used some credits from a purchase, you may be eligible for a partial 
                  refund for the unused portion, subject to the following:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• At least 50% of the purchased credits remain unused</li>
                  <li className="text-slate-300">• The purchase was made within the last 30 days</li>
                  <li className="text-slate-300">• The refund request is made in good faith</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">2.3 Technical Issues</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  If you experience technical issues that prevent you from using our service, 
                  you may be eligible for a refund:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-slate-300">• Service outages lasting more than 24 hours</li>
                  <li className="text-slate-300">• Critical bugs that prevent tool usage</li>
                  <li className="text-slate-300">• Payment processing errors</li>
                </ul>
              </LegalSection>

              {/* 3. Refund Timeframe */}
              <LegalSection
                id="timeframe"
                title="3. Refund Timeframe"
                isActive={activeSection === 'timeframe'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">3.1 Request Deadline</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Refund requests must be submitted within 30 days of the original purchase date. 
                  Requests submitted after this period will not be processed.
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">3.2 Processing Time</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Once your refund request is approved:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Mobile Money:</strong> 3-5 business days</li>
                  <li className="text-slate-300">• <strong className="text-white">Credit/Debit Cards:</strong> 5-10 business days</li>
                  <li className="text-slate-300">• <strong className="text-white">Bank Transfers:</strong> 5-7 business days</li>
                </ul>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Processing times may vary depending on your payment method and financial institution.
                </p>

                <div className="bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg p-4">
                  <p className="text-sm text-amber-300 leading-relaxed">
                    <strong>Note:</strong> Refunds are processed to the original payment method used for the purchase.
                  </p>
                </div>
              </LegalSection>

              {/* 4. Refund Process */}
              <LegalSection
                id="process"
                title="4. Refund Process"
                isActive={activeSection === 'process'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">4.1 How to Request a Refund</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  To request a refund, please follow these steps:
                </p>
                <ol className="space-y-3 ml-6 mb-4">
                  <li className="text-slate-300">
                    <strong className="text-white">Step 1:</strong> Log in to your account
                  </li>
                  <li className="text-slate-300">
                    <strong className="text-white">Step 2:</strong> Go to your account settings or contact support
                  </li>
                  <li className="text-slate-300">
                    <strong className="text-white">Step 3:</strong> Provide the following information:
                    <ul className="ml-6 mt-2 space-y-1">
                      <li className="text-slate-400">• Purchase date and transaction ID</li>
                      <li className="text-slate-400">• Amount of unused credits</li>
                      <li className="text-slate-400">• Reason for refund request</li>
                    </ul>
                  </li>
                  <li className="text-slate-300">
                    <strong className="text-white">Step 4:</strong> Submit your request
                  </li>
                </ol>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.2 Review Process</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Once submitted, your refund request will be reviewed within 2-3 business days. 
                  We may contact you for additional information if needed.
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.3 Approval & Processing</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  If approved, your refund will be processed according to the timeframes specified 
                  in Section 3.2. You will receive a confirmation email once the refund is initiated.
                </p>
              </LegalSection>

              {/* 5. Exceptions & Limitations */}
              <LegalSection
                id="exceptions"
                title="5. Exceptions & Limitations"
                isActive={activeSection === 'exceptions'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">5.1 Non-Refundable Items</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  The following are not eligible for refunds:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Credits that have been used to access our tools</li>
                  <li className="text-slate-300">• Purchases made more than 30 days ago</li>
                  <li className="text-slate-300">• Credits purchased through promotional offers (unless specified otherwise)</li>
                  <li className="text-slate-300">• Subscription fees (if applicable in the future)</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">5.2 Abuse Prevention</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We reserve the right to deny refund requests if we detect:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Fraudulent activity or abuse of the refund system</li>
                  <li className="text-slate-300">• Repeated refund requests without valid reasons</li>
                  <li className="text-slate-300">• Violation of our Terms of Service</li>
                </ul>

                <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4">
                  <p className="text-sm text-red-300 leading-relaxed">
                    <strong>Important:</strong> Refund requests that are denied due to abuse or 
                    violation of terms will not be reconsidered.
                  </p>
                </div>
              </LegalSection>

              {/* 6. Contact Us */}
              <LegalSection
                id="contact"
                title="6. Contact Us"
                isActive={activeSection === 'contact'}
              >
                <p className="text-slate-300 leading-relaxed mb-6">
                  If you have questions about this Refund Policy or need assistance with a refund request, 
                  please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">Refund Inquiries</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:refunds@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      refunds@aiassignmenthelper.com
                    </a>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">General Support</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:support@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      support@aiassignmenthelper.com
                    </a>
                  </div>
                </div>
                <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-lg p-4 mt-6">
                  <p className="text-sm text-emerald-300 leading-relaxed">
                    <strong>Response Time:</strong> We aim to respond to all refund inquiries within 
                    48 hours during business days (Monday-Friday, 9AM-5PM EAT).
                  </p>
                </div>
              </LegalSection>

              {/* Acceptance */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8 text-center mt-12"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  Questions About Refunds?
                </h3>
                <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto mb-6">
                  If you have any questions or concerns about our refund policy, please don&apos;t hesitate to contact us.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/contact">
                    <motion.button
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Contact Support
                    </motion.button>
                  </Link>
                  <Link href="/">
                    <motion.button
                      className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back to Home
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

