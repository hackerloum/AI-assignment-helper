'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <Link 
        href="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to login</span>
      </Link>

      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Reset your password
          </h1>
          <p className="text-slate-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"
          >
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Check your email
            </h2>
            <p className="text-slate-400 mb-4">
              We&apos;ve sent a password reset link to <span className="text-white font-semibold">{email}</span>
            </p>
            <Link
              href="/login"
              className="text-amber-500 hover:text-amber-400 font-semibold"
            >
              Return to login
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-400">{error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 transition-colors ${
                    email ? 'text-amber-500' : 'text-slate-500'
                  }`} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.ac.tz"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/30 disabled:shadow-none relative overflow-hidden"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </span>
            </motion.button>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Remember your password?{' '}
                <Link href="/login" className="text-amber-500 hover:text-amber-400 font-semibold">
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

