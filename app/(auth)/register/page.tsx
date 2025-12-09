'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthBrandPanel } from '@/components/auth/AuthBrandPanel'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function RegisterPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  useEffect(() => {
    // Check if we have debug logs from login redirect
    const loginDebug = localStorage.getItem('login_debug')
    if (loginDebug) {
      try {
        const parsed = JSON.parse(loginDebug)
        setDebugInfo(parsed)
        // Clear after reading
        localStorage.removeItem('login_debug')
      } catch (e) {
        console.error('Failed to parse debug info:', e)
      }
    }
  }, [])
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      {/* Debug Info Banner */}
      {debugInfo && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-red-500/20 border-b border-red-500/50 backdrop-blur-xl p-4">
          <div className="container mx-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-white font-bold mb-2">🐛 Login Debug Info - Redirected to Register</h3>
                <div className="bg-black/50 rounded-lg p-3 text-xs font-mono space-y-1">
                  {debugInfo.logs?.map((log: string, i: number) => (
                    <div key={i} className="text-emerald-400">{log}</div>
                  ))}
                  <div className="text-slate-500 mt-2">
                    Time: {new Date(debugInfo.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-amber-400 mt-2">
                    ⚠️ Middleware redirected to /register (session not found by middleware)
                  </div>
                </div>
                <button
                  onClick={() => setDebugInfo(null)}
                  className="mt-2 text-sm text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

