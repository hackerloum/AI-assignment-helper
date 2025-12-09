'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel'
import { ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Brand Experience */}
      <AuthBrandPanel 
        title="Start your academic success journey"
        description="Get 3 free AI-powered actions daily. No credit card required to start."
        features={[
          "AI Research Assistant",
          "Grammar & Rewriting Tool",
          "Plagiarism Checker",
          "APA Citation Generator",
          "PowerPoint Creator"
        ]}
        stats={{
          students: "10,000+",
          assignments: "50,000+",
          rating: "4.9/5.0"
        }}
      />

      {/* Right Panel - Register Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 relative overflow-y-auto auth-scrollbar">
        {/* Back to home link */}
        <Link 
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>

        {/* Form Container */}
        <motion.div 
          className="w-full max-w-md my-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Create your account
            </h1>
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Register Form Component */}
          <RegisterForm />

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-slate-400 hover:text-white underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-slate-400 hover:text-white underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

