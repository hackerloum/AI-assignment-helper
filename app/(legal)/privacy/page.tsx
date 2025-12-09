'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, Calendar } from 'lucide-react'
import { LegalTOC } from '@/components/legal/LegalTOC'
import { LegalSection } from '@/components/legal/LegalSection'

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'information', title: '2. Information We Collect' },
  { id: 'usage', title: '3. How We Use Your Information' },
  { id: 'sharing', title: '4. Information Sharing & Disclosure' },
  { id: 'storage', title: '5. Data Storage & Security' },
  { id: 'retention', title: '6. Data Retention' },
  { id: 'rights', title: '7. Your Rights & Choices' },
  { id: 'cookies', title: '8. Cookies & Tracking Technologies' },
  { id: 'third-party', title: '9. Third-Party Services' },
  { id: 'children', title: '10. Children\'s Privacy' },
  { id: 'international', title: '11. International Data Transfers' },
  { id: 'changes', title: '12. Changes to This Policy' },
  { id: 'contact', title: '13. Contact Us' },
]

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('introduction')

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
                <div className="p-3 bg-emerald-500/10 rounded-xl">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Privacy Policy
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Last updated: January 15, 2025</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed">
                  At AI Assignment Helper, we are committed to protecting your privacy and ensuring the security 
                  of your personal information. This Privacy Policy explains how we collect, use, disclose, and 
                  safeguard your information when you use our service. Please read this policy carefully.
                </p>
              </div>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {/* 1. Introduction */}
              <LegalSection
                id="introduction"
                title="1. Introduction"
                isActive={activeSection === 'introduction'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  AI Assignment Helper ("we," "us," or "our") operates an AI-powered academic assistance platform 
                  accessible at our website. This Privacy Policy describes our practices regarding the collection, 
                  use, and disclosure of information when you use our Service.
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  By using our Service, you agree to the collection and use of information in accordance with this 
                  Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
                </p>
                <div className="bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong>Scope:</strong> This Privacy Policy applies to all users of AI Assignment Helper, including 
                    visitors, registered users, and subscribers. It covers information collected through our website, 
                    web application, and any related services.
                  </p>
                </div>
              </LegalSection>

              {/* 2. Information We Collect */}
              <LegalSection
                id="information"
                title="2. Information We Collect"
                isActive={activeSection === 'information'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">2.1 Information You Provide</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We collect information that you provide directly to us when you:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Account Information:</strong> Name, email address, password (hashed and encrypted)</li>
                  <li className="text-slate-300">• <strong className="text-white">Profile Information:</strong> Optional profile details you choose to provide</li>
                  <li className="text-slate-300">• <strong className="text-white">Content:</strong> Text, documents, and other materials you input into our AI tools</li>
                  <li className="text-slate-300">• <strong className="text-white">Payment Information:</strong> Payment method details (processed securely by third-party providers)</li>
                  <li className="text-slate-300">• <strong className="text-white">Communications:</strong> Messages, feedback, and support requests you send to us</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">2.2 Automatically Collected Information</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  When you use our Service, we automatically collect certain information, including:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Usage Data:</strong> Features used, timestamps, session duration, and interaction patterns</li>
                  <li className="text-slate-300">• <strong className="text-white">Device Information:</strong> Device type, operating system, browser type and version</li>
                  <li className="text-slate-300">• <strong className="text-white">IP Address:</strong> Your Internet Protocol address and approximate location</li>
                  <li className="text-slate-300">• <strong className="text-white">Log Data:</strong> Server logs, error reports, and performance metrics</li>
                  <li className="text-slate-300">• <strong className="text-white">Cookies & Tracking:</strong> Information collected through cookies and similar technologies (see Section 8)</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">2.3 Information from Third Parties</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We may receive information about you from third-party services:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-slate-300">• <strong className="text-white">Payment Processors:</strong> Transaction status and payment confirmation</li>
                  <li className="text-slate-300">• <strong className="text-white">Authentication Providers:</strong> If you sign in using third-party services</li>
                  <li className="text-slate-300">• <strong className="text-white">Analytics Services:</strong> Aggregated usage statistics and insights</li>
                </ul>
              </LegalSection>

              {/* 3. How We Use Your Information */}
              <LegalSection
                id="usage"
                title="3. How We Use Your Information"
                isActive={activeSection === 'usage'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">3.1 Service Provision</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Process and deliver AI-generated content and responses</li>
                  <li className="text-slate-300">• Manage your account, subscriptions, and credit balance</li>
                  <li className="text-slate-300">• Process payments and manage billing</li>
                  <li className="text-slate-300">• Provide customer support and respond to inquiries</li>
                  <li className="text-slate-300">• Send service-related notifications and updates</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">3.2 Service Improvement</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Analyze usage patterns to improve our AI models and features</li>
                  <li className="text-slate-300">• Train and refine AI algorithms (using anonymized and aggregated data only)</li>
                  <li className="text-slate-300">• Identify and fix technical issues</li>
                  <li className="text-slate-300">• Develop new features and functionality</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">3.3 Communication</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Send important updates about your account or the Service</li>
                  <li className="text-slate-300">• Respond to your questions and support requests</li>
                  <li className="text-slate-300">• Send marketing communications (with your consent, which you can opt out of)</li>
                  <li className="text-slate-300">• Notify you about changes to our Terms or Privacy Policy</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">3.4 Legal & Security</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Comply with legal obligations and respond to legal requests</li>
                  <li className="text-slate-300">• Enforce our Terms of Service and prevent fraud or abuse</li>
                  <li className="text-slate-300">• Protect the rights, property, and safety of users and our company</li>
                  <li className="text-slate-300">• Investigate security incidents and prevent unauthorized access</li>
                </ul>

                <div className="bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg p-4 mt-6">
                  <p className="text-sm text-amber-300 leading-relaxed">
                    <strong>AI Training:</strong> We may use anonymized and aggregated data to improve our AI models. 
                    We do not use your personal information or identifiable content for AI training without your explicit consent.
                  </p>
                </div>
              </LegalSection>

              {/* 4. Information Sharing & Disclosure */}
              <LegalSection
                id="sharing"
                title="4. Information Sharing & Disclosure"
                isActive={activeSection === 'sharing'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.1 Service Providers</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We share information with trusted third-party service providers who assist us in operating our Service:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Cloud Hosting:</strong> Data storage and infrastructure (Supabase, Vercel)</li>
                  <li className="text-slate-300">• <strong className="text-white">Payment Processors:</strong> Payment processing (ZenoPay, mobile money providers)</li>
                  <li className="text-slate-300">• <strong className="text-white">AI Providers:</strong> AI model services (OpenAI, Anthropic)</li>
                  <li className="text-slate-300">• <strong className="text-white">Analytics:</strong> Usage analytics and performance monitoring</li>
                  <li className="text-slate-300">• <strong className="text-white">Email Services:</strong> Transactional and marketing emails</li>
                </ul>
                <p className="text-slate-300 leading-relaxed mb-4">
                  These providers are contractually obligated to protect your information and use it only for the purposes 
                  we specify.
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.2 Legal Requirements</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We may disclose your information if required by law or in response to:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Court orders, subpoenas, or legal processes</li>
                  <li className="text-slate-300">• Government requests or regulatory requirements</li>
                  <li className="text-slate-300">• Enforcement of our Terms of Service</li>
                  <li className="text-slate-300">• Protection of rights, property, or safety</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.3 Business Transfers</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred to the 
                  acquiring entity. We will notify you of any such change in ownership or control.
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.4 With Your Consent</h4>
                <p className="text-slate-300 leading-relaxed">
                  We may share your information with third parties when you explicitly consent to such sharing.
                </p>
              </LegalSection>

              {/* 5. Data Storage & Security */}
              <LegalSection
                id="storage"
                title="5. Data Storage & Security"
                isActive={activeSection === 'storage'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">5.1 Security Measures</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Encryption:</strong> Data in transit (TLS/SSL) and at rest (AES-256)</li>
                  <li className="text-slate-300">• <strong className="text-white">Access Controls:</strong> Role-based access and authentication requirements</li>
                  <li className="text-slate-300">• <strong className="text-white">Secure Infrastructure:</strong> Hosted on secure, compliant cloud platforms</li>
                  <li className="text-slate-300">• <strong className="text-white">Regular Audits:</strong> Security assessments and vulnerability testing</li>
                  <li className="text-slate-300">• <strong className="text-white">Password Security:</strong> Passwords are hashed using bcrypt and never stored in plain text</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">5.2 Data Location</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Your data is stored on secure servers located in:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Primary: United States (Supabase, Vercel)</li>
                  <li className="text-slate-300">• Backups: Multiple geographic regions for redundancy</li>
                </ul>
                <p className="text-slate-300 leading-relaxed mb-4">
                  By using our Service, you consent to the transfer and storage of your data in these locations.
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">5.3 Security Limitations</h4>
                <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4">
                  <p className="text-sm text-red-300 leading-relaxed">
                    <strong>Important:</strong> While we implement robust security measures, no method of transmission 
                    or storage is 100% secure. We cannot guarantee absolute security of your information. You use our 
                    Service at your own risk.
                  </p>
                </div>
              </LegalSection>

              {/* 6. Data Retention */}
              <LegalSection
                id="retention"
                title="6. Data Retention"
                isActive={activeSection === 'retention'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  We retain your information for as long as necessary to provide our Service and fulfill the purposes 
                  outlined in this Privacy Policy:
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">6.1 Account Data</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Active Accounts:</strong> Retained while your account is active</li>
                  <li className="text-slate-300">• <strong className="text-white">Deleted Accounts:</strong> Deleted within 30 days of account deletion request</li>
                  <li className="text-slate-300">• <strong className="text-white">Inactive Accounts:</strong> May be deleted after 2 years of inactivity</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">6.2 Content Data</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">User Inputs:</strong> Retained for service functionality and history</li>
                  <li className="text-slate-300">• <strong className="text-white">Generated Outputs:</strong> Stored for your access and reference</li>
                  <li className="text-slate-300">• <strong className="text-white">Deleted Content:</strong> Permanently deleted within 30 days</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">6.3 Legal Requirements</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We may retain certain information longer if required by law, legal process, or to resolve disputes. 
                  This includes:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-slate-300">• Payment and transaction records (7 years for tax purposes)</li>
                  <li className="text-slate-300">• Legal compliance data (as required by applicable law)</li>
                  <li className="text-slate-300">• Security and fraud prevention records</li>
                </ul>
              </LegalSection>

              {/* 7. Your Rights & Choices */}
              <LegalSection
                id="rights"
                title="7. Your Rights & Choices"
                isActive={activeSection === 'rights'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">7.1 Access & Portability</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Access:</strong> Request a copy of your personal information</li>
                  <li className="text-slate-300">• <strong className="text-white">Portability:</strong> Export your data in a machine-readable format</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">7.2 Correction & Deletion</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Update:</strong> Correct inaccurate or incomplete information</li>
                  <li className="text-slate-300">• <strong className="text-white">Delete:</strong> Request deletion of your account and data</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">7.3 Opt-Out & Preferences</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Marketing:</strong> Unsubscribe from marketing emails (link in footer)</li>
                  <li className="text-slate-300">• <strong className="text-white">Cookies:</strong> Manage cookie preferences in your browser settings</li>
                  <li className="text-slate-300">• <strong className="text-white">Notifications:</strong> Adjust notification preferences in account settings</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">7.4 Exercising Your Rights</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  To exercise any of these rights, please contact us at{' '}
                  <a href="mailto:privacy@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                    privacy@aiassignmenthelper.com
                  </a>
                  . We will respond to your request within 30 days.
                </p>

                <div className="bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg p-4 mt-6">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong>Verification:</strong> For security purposes, we may require verification of your identity 
                    before processing certain requests.
                  </p>
                </div>
              </LegalSection>

              {/* 8. Cookies & Tracking Technologies */}
              <LegalSection
                id="cookies"
                title="8. Cookies & Tracking Technologies"
                isActive={activeSection === 'cookies'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to enhance your experience and analyze Service usage.
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">8.1 Types of Cookies</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• <strong className="text-white">Essential:</strong> Required for Service functionality (authentication, security)</li>
                  <li className="text-slate-300">• <strong className="text-white">Analytics:</strong> Help us understand how you use our Service</li>
                  <li className="text-slate-300">• <strong className="text-white">Preferences:</strong> Remember your settings and preferences</li>
                  <li className="text-slate-300">• <strong className="text-white">Performance:</strong> Monitor and improve Service performance</li>
                </ul>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">8.2 Managing Cookies</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You can control cookies through your browser settings. However, disabling certain cookies may 
                  affect Service functionality.
                </p>

                <h4 className="text-lg font-semibold text-white mb-3 mt-6">8.3 Third-Party Tracking</h4>
                <p className="text-slate-300 leading-relaxed">
                  We use third-party analytics services (e.g., Vercel Analytics) that may use cookies and tracking 
                  technologies. These services are governed by their own privacy policies.
                </p>
              </LegalSection>

              {/* 9. Third-Party Services */}
              <LegalSection
                id="third-party"
                title="9. Third-Party Services"
                isActive={activeSection === 'third-party'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  Our Service integrates with third-party services. These services have their own privacy policies:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">Payment Processors</h4>
                    <p className="text-sm text-slate-400">ZenoPay, M-Pesa, Airtel Money, TigoPesa</p>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">AI Providers</h4>
                    <p className="text-sm text-slate-400">OpenAI, Anthropic</p>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">Hosting & Infrastructure</h4>
                    <p className="text-sm text-slate-400">Supabase, Vercel</p>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-2">Analytics</h4>
                    <p className="text-sm text-slate-400">Vercel Analytics</p>
                  </div>
                </div>

                <div className="bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg p-4">
                  <p className="text-sm text-amber-300 leading-relaxed">
                    <strong>Note:</strong> We are not responsible for the privacy practices of third-party services. 
                    We encourage you to review their privacy policies.
                  </p>
                </div>
              </LegalSection>

              {/* 10. Children's Privacy */}
              <LegalSection
                id="children"
                title="10. Children's Privacy"
                isActive={activeSection === 'children'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  Our Service is not intended for children under 18 years of age. We do not knowingly collect 
                  personal information from children under 18.
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact us immediately. We will delete such information upon verification.
                </p>
                <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4">
                  <p className="text-sm text-red-300 leading-relaxed">
                    <strong>Age Requirement:</strong> Users under 18 must have parental or guardian consent to use 
                    our Service, as stated in our Terms of Service.
                  </p>
                </div>
              </LegalSection>

              {/* 11. International Data Transfers */}
              <LegalSection
                id="international"
                title="11. International Data Transfers"
                isActive={activeSection === 'international'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  Your information may be transferred to and processed in countries other than your country of 
                  residence, including the United States and other jurisdictions where our service providers operate.
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  These countries may have different data protection laws than your country. By using our Service, 
                  you consent to the transfer of your information to these countries.
                </p>
                <div className="bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong>Safeguards:</strong> We implement appropriate safeguards (contractual, technical, and 
                    organizational) to protect your information during international transfers.
                  </p>
                </div>
              </LegalSection>

              {/* 12. Changes to This Policy */}
              <LegalSection
                id="changes"
                title="12. Changes to This Policy"
                isActive={activeSection === 'changes'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. When we make changes:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• We will update the "Last Updated" date at the top of this page</li>
                  <li className="text-slate-300">• We will notify you via email and/or in-app notification</li>
                  <li className="text-slate-300">• Material changes will be announced 30 days before taking effect</li>
                  <li className="text-slate-300">• Continued use after changes constitutes acceptance</li>
                </ul>
                
                <div className="bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg p-4 mt-6">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong>Your Rights:</strong> If you disagree with modified Privacy Policy, you may terminate 
                    your account before the changes take effect. Continued use after the effective date means you 
                    accept the new Privacy Policy.
                  </p>
                </div>
              </LegalSection>

              {/* 13. Contact Us */}
              <LegalSection
                id="contact"
                title="13. Contact Us"
                isActive={activeSection === 'contact'}
              >
                <p className="text-slate-300 leading-relaxed mb-6">
                  If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">Privacy Inquiries</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:privacy@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      privacy@aiassignmenthelper.com
                    </a>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">General Support</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:support@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      support@aiassignmenthelper.com
                    </a>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">Data Protection Officer</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:dpo@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      dpo@aiassignmenthelper.com
                    </a>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">Mailing Address</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      AI Assignment Helper<br />
                      Data Protection Officer<br />
                      Dar es Salaam, Tanzania<br />
                      East Africa
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-lg p-4 mt-6">
                  <p className="text-sm text-emerald-300 leading-relaxed">
                    <strong>Response Time:</strong> We aim to respond to all privacy inquiries within 48 hours 
                    during business days (Monday-Friday, 9AM-5PM EAT).
                  </p>
                </div>
              </LegalSection>

              {/* Acceptance */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center mt-12"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  Privacy Commitment
                </h3>
                <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  We are committed to protecting your privacy and being transparent about our data practices. 
                  If you have any questions or concerns, please don't hesitate to contact us.
                </p>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Link href="/terms">
                    <motion.button
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Terms of Service
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

