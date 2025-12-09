import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service - AI Assignment Helper',
  description: 'Terms of Service for AI Assignment Helper',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1E293B] to-[#0A0E27] p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <p className="text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>
            
            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using AI Assignment Helper, you accept and agree to be bound by 
                the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily use AI Assignment Helper for personal, 
                non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password 
                and for restricting access to your computer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Prohibited Uses</h2>
              <p>
                You may not use our service for any illegal or unauthorized purpose, or to violate 
                any laws in your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mt-8 mb-4">5. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

