'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, Calendar } from 'lucide-react'
import { LegalTOC } from '@/components/legal/LegalTOC'
import { LegalSection } from '@/components/legal/LegalSection'

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'description', title: '2. Service Description' },
  { id: 'registration', title: '3. User Registration & Account' },
  { id: 'subscription', title: '4. Subscription & Payment' },
  { id: 'usage', title: '5. Acceptable Use Policy' },
  { id: 'intellectual', title: '6. Intellectual Property' },
  { id: 'data', title: '7. User Data & Privacy' },
  { id: 'termination', title: '8. Account Termination' },
  { id: 'disclaimer', title: '9. Disclaimers & Warranties' },
  { id: 'limitation', title: '10. Limitation of Liability' },
  { id: 'governing', title: '11. Governing Law' },
  { id: 'changes', title: '12. Changes to Terms' },
  { id: 'contact', title: '13. Contact Information' },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance')

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
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Terms of Service
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Last updated: January 15, 2025</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
                <p className="text-slate-300 leading-relaxed">
                  Please read these Terms of Service carefully before using AI Assignment Helper. 
                  By accessing or using our service, you agree to be bound by these terms. If you 
                  disagree with any part of these terms, you may not access the service.
                </p>
              </div>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {/* 1. Acceptance of Terms */}
              <LegalSection
                id="acceptance"
                title="1. Acceptance of Terms"
                isActive={activeSection === 'acceptance'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  By creating an account and using AI Assignment Helper ("the Service"), you acknowledge 
                  that you have read, understood, and agree to be bound by these Terms of Service and our 
                  Privacy Policy.
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  These terms constitute a legally binding agreement between you ("User" or "you") and 
                  AI Assignment Helper ("Company," "we," or "us") regarding your use of our web-based 
                  platform and services.
                </p>
                <div className="bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg p-4">
                  <p className="text-sm text-amber-300">
                    <strong>Important:</strong> You must be at least 18 years old or have parental/guardian 
                    consent to use this service. By using the Service, you represent that you meet this requirement.
                  </p>
                </div>
              </LegalSection>

              {/* 2. Service Description */}
              <LegalSection
                id="description"
                title="2. Service Description"
                isActive={activeSection === 'description'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  AI Assignment Helper provides an AI-powered academic assistance platform designed for 
                  college students in Tanzania and beyond. Our services include:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">AI Research Assistant:</strong> Comprehensive answers to academic questions</span>
                  </li>
                  <li className="text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">Grammar & Rewriting Tool:</strong> Text improvement and proofreading</span>
                  </li>
                  <li className="text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">Plagiarism Checker:</strong> Content originality verification</span>
                  </li>
                  <li className="text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">APA Citation Generator:</strong> Automatic reference formatting</span>
                  </li>
                  <li className="text-slate-300 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">PowerPoint Generator:</strong> Automated presentation creation</span>
                  </li>
                </ul>
                <p className="text-slate-300 leading-relaxed">
                  We reserve the right to modify, suspend, or discontinue any feature of the Service at 
                  any time with or without notice. We are not liable for any modification, suspension, or 
                  discontinuance of the Service.
                </p>
              </LegalSection>

              {/* 3. User Registration & Account */}
              <LegalSection
                id="registration"
                title="3. User Registration & Account"
                isActive={activeSection === 'registration'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">3.1 Account Creation</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  To access certain features of the Service, you must create an account by providing:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Valid email address</li>
                  <li className="text-slate-300">• Secure password</li>
                  <li className="text-slate-300">• Full name</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">3.2 Account Responsibility</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You are responsible for:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Maintaining the confidentiality of your account credentials</li>
                  <li className="text-slate-300">• All activities that occur under your account</li>
                  <li className="text-slate-300">• Notifying us immediately of any unauthorized use</li>
                  <li className="text-slate-300">• Ensuring your account information is accurate and up-to-date</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">3.3 Account Restrictions</h4>
                <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4">
                  <p className="text-sm text-red-300 mb-2">
                    <strong>You may NOT:</strong>
                  </p>
                  <ul className="space-y-1 ml-4 text-sm text-red-300">
                    <li>• Share your account with others</li>
                    <li>• Create multiple accounts for the same person</li>
                    <li>• Use false or misleading information</li>
                    <li>• Impersonate another person or entity</li>
                    <li>• Sell, transfer, or assign your account</li>
                  </ul>
                </div>
              </LegalSection>

              {/* 4. Subscription & Payment */}
              <LegalSection
                id="subscription"
                title="4. Subscription & Payment"
                isActive={activeSection === 'subscription'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">4.1 Free Tier</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  All users receive <strong className="text-white">3 free AI actions per day</strong>. 
                  The free tier resets at midnight (East Africa Time) and includes access to all tools 
                  with usage limits.
                </p>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.2 Paid Subscriptions</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">500 TZS</span>
                      <span className="text-slate-400">/day</span>
                    </div>
                    <p className="text-sm text-slate-400">24-hour unlimited access</p>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-white">5,000 TZS</span>
                      <span className="text-slate-400">/month</span>
                    </div>
                    <p className="text-sm text-slate-400">30-day unlimited access</p>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.3 Payment Terms</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• All payments are processed in Tanzanian Shillings (TZS)</li>
                  <li className="text-slate-300">• Accepted methods: M-Pesa, Airtel Money, TigoPesa, HaloPesa</li>
                  <li className="text-slate-300">• Payments are non-refundable except as required by law</li>
                  <li className="text-slate-300">• Subscriptions begin immediately upon successful payment</li>
                  <li className="text-slate-300">• Daily subscriptions expire after 24 hours</li>
                  <li className="text-slate-300">• Monthly subscriptions expire after 30 days</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.4 Refund Policy</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Refunds are provided only in the following circumstances:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Technical issues preventing service access (verified by our team)</li>
                  <li className="text-slate-300">• Duplicate charges due to payment processing errors</li>
                  <li className="text-slate-300">• Service outages exceeding 24 hours (pro-rated refund)</li>
                </ul>
                <p className="text-slate-300 leading-relaxed">
                  Refund requests must be submitted within 7 days of payment to{' '}
                  <a href="mailto:support@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                    support@aiassignmenthelper.com
                  </a>
                </p>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">4.5 Price Changes</h4>
                <p className="text-slate-300 leading-relaxed">
                  We reserve the right to change subscription prices with 30 days' notice. Current 
                  subscribers will be notified via email and in-app notifications. Price changes do not 
                  affect active subscriptions until renewal.
                </p>
              </LegalSection>

              {/* 5. Acceptable Use Policy */}
              <LegalSection
                id="usage"
                title="5. Acceptable Use Policy"
                isActive={activeSection === 'usage'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">5.1 Permitted Use</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You may use AI Assignment Helper for legitimate academic purposes, including:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Research assistance and information gathering</li>
                  <li className="text-slate-300">• Improving your writing and grammar</li>
                  <li className="text-slate-300">• Checking work for originality</li>
                  <li className="text-slate-300">• Creating proper academic citations</li>
                  <li className="text-slate-300">• Developing presentation materials</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">5.2 Prohibited Activities</h4>
                <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4 mb-4">
                  <p className="text-sm text-red-300 mb-3">
                    <strong>You are strictly prohibited from:</strong>
                  </p>
                  <ul className="space-y-2 ml-4 text-sm text-red-300">
                    <li>• Submitting AI-generated content as your own original work</li>
                    <li>• Using the service to complete exams or assessments</li>
                    <li>• Violating your institution's academic integrity policies</li>
                    <li>• Reverse engineering or attempting to extract our AI models</li>
                    <li>• Automated scraping or data mining of the platform</li>
                    <li>• Sharing your subscription access with others</li>
                    <li>• Uploading malicious code, viruses, or harmful content</li>
                    <li>• Harassing, abusing, or threatening other users or staff</li>
                    <li>• Using the service for illegal or unethical purposes</li>
                    <li>• Attempting to gain unauthorized access to our systems</li>
                  </ul>
                </div>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">5.3 Academic Integrity</h4>
                <div className="bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg p-4">
                  <p className="text-sm text-amber-300 leading-relaxed">
                    <strong>Important Notice:</strong> AI Assignment Helper is designed as a learning aid, 
                    not a replacement for your own work. You are responsible for ensuring your use of the 
                    Service complies with your institution's academic integrity policies. We encourage 
                    transparent use and proper attribution of AI assistance where required by your institution.
                  </p>
                </div>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">5.4 Content Guidelines</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You agree not to input or generate content that:
                </p>
                <ul className="space-y-2 ml-6">
                  <li className="text-slate-300">• Contains hate speech, discrimination, or harassment</li>
                  <li className="text-slate-300">• Promotes violence or illegal activities</li>
                  <li className="text-slate-300">• Includes personal information of others without consent</li>
                  <li className="text-slate-300">• Infringes on intellectual property rights</li>
                  <li className="text-slate-300">• Contains sexually explicit or inappropriate material</li>
                </ul>
              </LegalSection>

              {/* 6. Intellectual Property */}
              <LegalSection
                id="intellectual"
                title="6. Intellectual Property"
                isActive={activeSection === 'intellectual'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">6.1 Service Content</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  All content, features, and functionality of AI Assignment Helper (including but not 
                  limited to software, text, graphics, logos, icons, images, audio clips, and data 
                  compilations) are the exclusive property of AI Assignment Helper and are protected by 
                  international copyright, trademark, and other intellectual property laws.
                </p>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">6.2 User Content</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You retain all rights to content you input into the Service. By using the Service, you 
                  grant us a limited license to:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Process your input to generate outputs</li>
                  <li className="text-slate-300">• Store your data as outlined in our Privacy Policy</li>
                  <li className="text-slate-300">• Improve our AI models (anonymized and aggregated only)</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">6.3 AI-Generated Content</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Content generated by our AI tools is provided for your use. However:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• We do not claim ownership of AI-generated outputs</li>
                  <li className="text-slate-300">• You are responsible for reviewing and editing outputs</li>
                  <li className="text-slate-300">• We do not guarantee originality or accuracy of outputs</li>
                  <li className="text-slate-300">• You must comply with academic integrity requirements</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">6.4 Trademarks</h4>
                <p className="text-slate-300 leading-relaxed">
                  "AI Assignment Helper" and related logos are trademarks of our company. You may not use 
                  these trademarks without our prior written consent.
                </p>
              </LegalSection>

              {/* 7. User Data & Privacy */}
              <LegalSection
                id="data"
                title="7. User Data & Privacy"
                isActive={activeSection === 'data'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  Your privacy is important to us. Our collection, use, and protection of your personal 
                  information is governed by our{' '}
                  <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline">
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms by reference.
                </p>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">7.1 Data We Collect</h4>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Account information (email, name)</li>
                  <li className="text-slate-300">• Usage data (features used, timestamps)</li>
                  <li className="text-slate-300">• Input text and generated outputs</li>
                  <li className="text-slate-300">• Payment information (processed by third-party providers)</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">7.2 Data Retention</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We retain your data for as long as your account is active or as needed to provide services. 
                  You may request data deletion by contacting us at{' '}
                  <a href="mailto:privacy@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                    privacy@aiassignmenthelper.com
                  </a>
                </p>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">7.3 Data Security</h4>
                <p className="text-slate-300 leading-relaxed">
                  We implement industry-standard security measures to protect your data, including 
                  encryption, secure servers, and access controls. However, no method of transmission 
                  over the internet is 100% secure.
                </p>
              </LegalSection>

              {/* 8. Account Termination */}
              <LegalSection
                id="termination"
                title="8. Account Termination"
                isActive={activeSection === 'termination'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">8.1 Termination by You</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You may terminate your account at any time by:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Logging into your account settings</li>
                  <li className="text-slate-300">• Clicking "Delete Account"</li>
                  <li className="text-slate-300">• Or emailing{' '}
                    <a href="mailto:support@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      support@aiassignmenthelper.com
                    </a>
                  </li>
                </ul>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Upon termination, your access to the Service will cease immediately. We may retain 
                  certain data as required by law or legitimate business purposes.
                </p>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">8.2 Termination by Us</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We reserve the right to suspend or terminate your account immediately, without notice, 
                  if you:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Violate these Terms of Service</li>
                  <li className="text-slate-300">• Engage in fraudulent activity</li>
                  <li className="text-slate-300">• Abuse or misuse the Service</li>
                  <li className="text-slate-300">• Fail to pay subscription fees</li>
                  <li className="text-slate-300">• Pose a security or legal risk</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">8.3 Effects of Termination</h4>
                <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-4">
                  <p className="text-slate-300 leading-relaxed">
                    Upon termination: (a) Your access to the Service will be revoked; (b) Your subscription 
                    will not be refunded; (c) Your data may be deleted after a grace period; (d) Any 
                    outstanding obligations remain in effect.
                  </p>
                </div>
              </LegalSection>

              {/* 9. Disclaimers & Warranties */}
              <LegalSection
                id="disclaimer"
                title="9. Disclaimers & Warranties"
                isActive={activeSection === 'disclaimer'}
              >
                <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4 mb-6">
                  <p className="text-sm text-red-300 uppercase font-semibold mb-2">
                    IMPORTANT LEGAL NOTICE
                  </p>
                  <p className="text-sm text-red-300 leading-relaxed">
                    THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
                    EITHER EXPRESS OR IMPLIED.
                  </p>
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">9.1 No Warranty</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We disclaim all warranties, including but not limited to:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Accuracy, completeness, or reliability of AI-generated content</li>
                  <li className="text-slate-300">• Uninterrupted or error-free service operation</li>
                  <li className="text-slate-300">• Security or privacy of data transmission</li>
                  <li className="text-slate-300">• Fitness for any particular purpose</li>
                  <li className="text-slate-300">• Non-infringement of third-party rights</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">9.2 AI Limitations</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  You acknowledge that:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• AI-generated content may contain errors or inaccuracies</li>
                  <li className="text-slate-300">• Plagiarism detection is not 100% accurate</li>
                  <li className="text-slate-300">• Citations may require manual verification</li>
                  <li className="text-slate-300">• The Service is a tool, not a substitute for human judgment</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">9.3 Third-Party Services</h4>
                <p className="text-slate-300 leading-relaxed">
                  We use third-party payment processors and AI providers. We are not responsible for their 
                  performance, availability, or security practices.
                </p>
              </LegalSection>

              {/* 10. Limitation of Liability */}
              <LegalSection
                id="limitation"
                title="10. Limitation of Liability"
                isActive={activeSection === 'limitation'}
              >
                <div className="bg-red-500/5 border-l-4 border-red-500 rounded-r-lg p-4 mb-6">
                  <p className="text-sm text-red-300 uppercase font-semibold mb-2">
                    LIABILITY CAP
                  </p>
                  <p className="text-sm text-red-300 leading-relaxed">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIMS RELATED TO 
                    THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE CLAIM.
                  </p>
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">10.1 No Consequential Damages</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  We shall not be liable for:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• Academic consequences (grades, expulsion, disciplinary action)</li>
                  <li className="text-slate-300">• Lost data or work product</li>
                  <li className="text-slate-300">• Lost profits or opportunities</li>
                  <li className="text-slate-300">• Indirect, incidental, or consequential damages</li>
                  <li className="text-slate-300">• Damages resulting from your use or misuse of the Service</li>
                </ul>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">10.2 Academic Responsibility</h4>
                <div className="bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg p-4">
                  <p className="text-sm text-amber-300 leading-relaxed">
                    <strong>Critical Notice:</strong> You are solely responsible for how you use AI-generated 
                    content. We are not responsible for academic integrity violations, plagiarism accusations, 
                    or other consequences resulting from your use of the Service.
                  </p>
                </div>
              </LegalSection>

              {/* 11. Governing Law */}
              <LegalSection
                id="governing"
                title="11. Governing Law"
                isActive={activeSection === 'governing'}
              >
                <h4 className="text-lg font-semibold text-white mb-3">11.1 Jurisdiction</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of the United 
                  Republic of Tanzania, without regard to its conflict of law provisions.
                </p>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">11.2 Dispute Resolution</h4>
                <p className="text-slate-300 leading-relaxed mb-4">
                  Any disputes arising from these Terms or your use of the Service shall be resolved through:
                </p>
                <ol className="space-y-3 ml-6 mb-4">
                  <li className="text-slate-300">
                    <strong className="text-white">1. Informal Resolution:</strong> Contact us at{' '}
                    <a href="mailto:legal@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      legal@aiassignmenthelper.com
                    </a>{' '}
                    to attempt resolution (required first step)
                  </li>
                  <li className="text-slate-300">
                    <strong className="text-white">2. Mediation:</strong> If informal resolution fails, 
                    disputes shall be submitted to mediation in Dar es Salaam, Tanzania
                  </li>
                  <li className="text-slate-300">
                    <strong className="text-white">3. Arbitration/Litigation:</strong> Unresolved disputes 
                    shall be subject to the exclusive jurisdiction of the courts of Dar es Salaam, Tanzania
                  </li>
                </ol>
                <h4 className="text-lg font-semibold text-white mb-3 mt-6">11.3 Language</h4>
                <p className="text-slate-300 leading-relaxed">
                  These Terms are written in English. Any translation is provided for convenience only. 
                  In case of conflict, the English version prevails.
                </p>
              </LegalSection>

              {/* 12. Changes to Terms */}
              <LegalSection
                id="changes"
                title="12. Changes to Terms"
                isActive={activeSection === 'changes'}
              >
                <p className="text-slate-300 leading-relaxed mb-4">
                  We reserve the right to modify these Terms at any time. When we make changes:
                </p>
                <ul className="space-y-2 ml-6 mb-4">
                  <li className="text-slate-300">• We will update the "Last Updated" date at the top of this page</li>
                  <li className="text-slate-300">• We will notify you via email and/or in-app notification</li>
                  <li className="text-slate-300">• Material changes will be announced 30 days before taking effect</li>
                  <li className="text-slate-300">• Continued use after changes constitutes acceptance</li>
                </ul>
                
                <div className="bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg p-4 mt-6">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <strong>Your Rights:</strong> If you disagree with modified Terms, you may terminate 
                    your account before the changes take effect. Continued use after the effective date 
                    means you accept the new Terms.
                  </p>
                </div>
              </LegalSection>

              {/* 13. Contact Information */}
              <LegalSection
                id="contact"
                title="13. Contact Information"
                isActive={activeSection === 'contact'}
              >
                <p className="text-slate-300 leading-relaxed mb-6">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">General Inquiries</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:support@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      support@aiassignmenthelper.com
                    </a>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">Legal Matters</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:legal@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      legal@aiassignmenthelper.com
                    </a>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">Privacy Concerns</h4>
                    <p className="text-sm text-slate-400 mb-2">Email:</p>
                    <a href="mailto:privacy@aiassignmenthelper.com" className="text-amber-400 hover:text-amber-300 underline">
                      privacy@aiassignmenthelper.com
                    </a>
                  </div>
                  <div className="bg-dashboard-elevated border border-dashboard-border rounded-xl p-6">
                    <h4 className="font-semibold text-white mb-3">Mailing Address</h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      AI Assignment Helper<br />
                      Dar es Salaam, Tanzania<br />
                      East Africa
                    </p>
                  </div>
                </div>
                <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-lg p-4 mt-6">
                  <p className="text-sm text-emerald-300 leading-relaxed">
                    <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours 
                    during business days (Monday-Friday, 9AM-5PM EAT).
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
                  Agreement Acknowledgment
                </h3>
                <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  By creating an account or using AI Assignment Helper, you acknowledge that you have read, 
                  understood, and agree to be bound by these Terms of Service and our Privacy Policy.
                </p>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Link href="/register">
                    <motion.button
                      className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Account
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

