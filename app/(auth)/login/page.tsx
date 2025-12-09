'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel - Brand Experience */}
      <AuthBrandPanel 
        title="Welcome back to AI Assignment Helper"
        description="Join 10,000+ students who are achieving academic excellence with AI-powered tools."
        testimonial={{
          text: "This tool saved me countless hours on my research paper. The APA citations alone are worth the subscription!",
          author: "Amina Hassan",
          role: "Law Student, UDSM",
        }}
      />

      {/* Right Panel - Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 relative">
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
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Sign in to your account
            </h1>
            <p className="text-slate-400">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Login Form Component */}
          <LoginForm />

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              By signing in, you agree to our{' '}
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

