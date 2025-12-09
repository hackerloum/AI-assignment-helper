'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  
  // Real-time validation
  const validateEmail = (value: string) => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email'
    return null
  }

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Password must be at least 6 characters'
    return null
  }

  const handleEmailBlur = () => {
    const error = validateEmail(email)
    setErrors(prev => ({ ...prev, email: error || undefined }))
  }

  const handlePasswordBlur = () => {
    const error = validatePassword(password)
    setErrors(prev => ({ ...prev, password: error || undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError || undefined,
        password: passwordError || undefined,
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' })
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please verify your email before signing in.' })
        } else {
          setErrors({ general: error.message })
        }
        setIsLoading(false)
        return
      }

      // Login successful - verify we have data
      if (!data || !data.user) {
        setErrors({ general: 'Login succeeded but no user data received. Please try again.' })
        setIsLoading(false)
        return
      }

      console.log('✅ Login successful, user:', data.user.email)
      
      // Success animation
      setSuccess(true)
      
      // Wait for cookies to be set, then redirect
      // The key is to ensure cookies are available to middleware
      setTimeout(async () => {
        // Verify session before redirecting
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session check:', session ? 'Found ✅' : 'Not found ❌')
        
        if (session) {
          console.log('Session confirmed, waiting for cookies to propagate...')
          
          // Wait additional time for cookies to be available to middleware
          // Then use router.push which works better with Next.js middleware
          setTimeout(() => {
            console.log('Redirecting to dashboard via router...')
            router.refresh() // Refresh to sync server state
            router.push('/dashboard')
            
            // Fallback: if router.push doesn't work, use window.location after a delay
            setTimeout(() => {
              if (window.location.pathname === '/login') {
                console.log('Router push failed, using window.location...')
                window.location.href = '/dashboard'
              }
            }, 1000)
          }, 2000)
        } else {
          console.log('Session not ready, waiting longer...')
          // Wait more and try again
          setTimeout(() => {
            console.log('Force redirecting to dashboard...')
            window.location.href = '/dashboard'
          }, 3000)
        }
      }, 2000)
    } catch (error: any) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Message */}
      <AnimatePresence>
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">
                {errors.general}
              </p>
            </div>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-400">
                Login successful! Redirecting to dashboard...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-300">
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className={`w-5 h-5 transition-colors ${
              errors.email ? 'text-red-400' : email ? 'text-amber-500' : 'text-slate-500'
            }`} />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
            }}
            onBlur={handleEmailBlur}
            disabled={isLoading || success}
            placeholder="you@university.ac.tz"
            className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border ${
              errors.email 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-amber-500'
            } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              errors.email ? 'focus:ring-red-500/20' : 'focus:ring-amber-500/20'
            } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
          />
        </div>
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.email}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
            Password
          </label>
          <Link 
            href="/forgot-password"
            className="text-sm text-amber-500 hover:text-amber-400 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className={`w-5 h-5 transition-colors ${
              errors.password ? 'text-red-400' : password ? 'text-amber-500' : 'text-slate-500'
            }`} />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (errors.password) setErrors(prev => ({ ...prev, password: undefined }))
            }}
            onBlur={handlePasswordBlur}
            disabled={isLoading || success}
            placeholder="Enter your password"
            className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border ${
              errors.password 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-amber-500'
            } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              errors.password ? 'focus:ring-red-500/20' : 'focus:ring-amber-500/20'
            } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
            disabled={isLoading || success}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <AnimatePresence>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.password}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          id="remember"
          type="checkbox"
          disabled={isLoading || success}
          className="w-4 h-4 bg-white/5 border-white/10 rounded text-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-slate-400 cursor-pointer">
          Remember me for 30 days
        </label>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || success}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none relative overflow-hidden group"
        whileHover={{ scale: isLoading || success ? 1 : 1.02 }}
        whileTap={{ scale: isLoading || success ? 1 : 0.98 }}
      >
        {/* Button shine effect */}
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
              Signing in...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Success!
            </>
          ) : (
            'Sign in to dashboard'
          )}
        </span>
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#1E293B] text-slate-500">Or continue with</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          type="button"
          disabled={isLoading || success}
          className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </motion.button>

        <motion.button
          type="button"
          disabled={isLoading || success}
          className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </motion.button>
      </div>
    </form>
  )
}

