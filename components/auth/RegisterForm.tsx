'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, CheckCircle, Check } from 'lucide-react'

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<'account' | 'verification'>('account')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    }

    const score = Object.values(checks).filter(Boolean).length

    let label = 'Weak'
    let color = 'red'

    if (score >= 4) {
      label = 'Strong'
      color = 'emerald'
    } else if (score >= 3) {
      label = 'Medium'
      color = 'amber'
    }

    return { score, label, color, checks }
  }

  const passwordStrength = password ? calculatePasswordStrength(password) : null

  // Validation functions
  const validateFullName = (value: string) => {
    if (!value.trim()) return 'Full name is required'
    if (value.trim().length < 2) return 'Name must be at least 2 characters'
    if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters'
    return null
  }

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) return 'Please enter a valid email'
    return null
  }

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (passwordStrength && passwordStrength.score < 3) {
      return 'Please use a stronger password'
    }
    return null
  }

  const validateConfirmPassword = (value: string) => {
    if (!value) return 'Please confirm your password'
    if (value !== password) return 'Passwords do not match'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const nameError = validateFullName(fullName)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmError = validateConfirmPassword(confirmPassword)
    
    if (nameError || emailError || passwordError || confirmError) {
      setErrors({
        fullName: nameError || undefined,
        email: emailError || undefined,
        password: passwordError || undefined,
        confirmPassword: confirmError || undefined,
      })
      return
    }

    if (!acceptedTerms) {
      setErrors({ general: 'Please accept the terms and conditions' })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ 
            general: 'This email is already registered. Please sign in instead.' 
          })
        } else {
          setErrors({ general: error.message })
        }
        return
      }

      // Move to verification step
      setStep('verification')
    } catch (error: any) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'verification') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Check your email
        </h2>
        
        <p className="text-slate-400 mb-2">
          We&apos;ve sent a verification link to:
        </p>
        
        <p className="text-amber-400 font-semibold text-lg mb-8">
          {email}
        </p>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-3">Next steps:</h3>
          <ol className="text-left space-y-2 text-slate-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">1.</span>
              <span>Open the email we just sent you</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">2.</span>
              <span>Click the verification link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">3.</span>
              <span>You&apos;ll be automatically signed in</span>
            </li>
          </ol>
        </div>

        <p className="text-sm text-slate-500">
          Didn&apos;t receive the email?{' '}
          <button 
            className="text-amber-500 hover:text-amber-400 font-semibold"
            onClick={() => {
              // Implement resend logic
            }}
          >
            Resend verification email
          </button>
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
            <p className="text-sm font-medium text-red-400">
              {errors.general}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Name Field */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className={`w-5 h-5 transition-colors ${
              errors.fullName ? 'text-red-400' : fullName ? 'text-amber-500' : 'text-slate-500'
            }`} />
          </div>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }))
            }}
            onBlur={() => {
              const error = validateFullName(fullName)
              setErrors(prev => ({ ...prev, fullName: error || undefined }))
            }}
            disabled={isLoading}
            placeholder="John Doe"
            className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
              errors.fullName 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-amber-500'
            } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              errors.fullName ? 'focus:ring-red-500/20' : 'focus:ring-amber-500/20'
            } transition-all duration-200 disabled:opacity-50 backdrop-blur-sm`}
          />
        </div>
        <AnimatePresence>
          {errors.fullName && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.fullName}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

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
            onBlur={() => {
              const error = validateEmail(email)
              setErrors(prev => ({ ...prev, email: error || undefined }))
            }}
            disabled={isLoading}
            placeholder="you@university.ac.tz"
            className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
              errors.email 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-amber-500'
            } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              errors.email ? 'focus:ring-red-500/20' : 'focus:ring-amber-500/20'
            } transition-all duration-200 disabled:opacity-50 backdrop-blur-sm`}
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
        <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
          Password
        </label>
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
            disabled={isLoading}
            placeholder="Create a strong password"
            className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
              errors.password 
                ? 'border-red-500/50 focus:border-red-500' 
                : 'border-white/10 focus:border-amber-500'
            } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              errors.password ? 'focus:ring-red-500/20' : 'focus:ring-amber-500/20'
            } transition-all duration-200 disabled:opacity-50 backdrop-blur-sm`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && passwordStrength && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2"
          >
            {/* Strength bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    passwordStrength.color === 'emerald' ? 'bg-emerald-500' :
                    passwordStrength.color === 'amber' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`text-xs font-semibold ${
                passwordStrength.color === 'emerald' ? 'text-emerald-400' :
                passwordStrength.color === 'amber' ? 'text-amber-400' :
                'text-red-400'
              }`}>
                {passwordStrength.label}
              </span>
            </div>

            {/* Requirements checklist */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { key: 'length', label: '8+ characters' },
                { key: 'uppercase', label: 'Uppercase letter' },
                { key: 'lowercase', label: 'Lowercase letter' },
                { key: 'number', label: 'Number' },
              ].map(({ key, label }) => {
                const met = passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-1.5 ${
                      met ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${
                      met ? 'bg-emerald-500/20' : 'bg-white/5'
                    }`}>
                      {met && <Check className="w-2.5 h-2.5" />}
                    </div>
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300">
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className={`w-5 h-5 transition-colors ${
              errors.confirmPassword ? 'text-red-400' : 
              confirmPassword && confirmPassword === password ? 'text-emerald-500' : 'text-slate-500'
            }`} />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }))
            }}
            onBlur={() => {
              const error = validateConfirmPassword(confirmPassword)
              setErrors(prev => ({ ...prev, confirmPassword: error || undefined }))
            }}
            disabled={isLoading}
            placeholder="Re-enter your password"
            className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
              errors.confirmPassword 
                ? 'border-red-500/50 focus:border-red-500' 
                : confirmPassword && confirmPassword === password
                ? 'border-emerald-500/50 focus:border-emerald-500'
                : 'border-white/10 focus:border-amber-500'
            } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
              errors.confirmPassword ? 'focus:ring-red-500/20' : 'focus:ring-amber-500/20'
            } transition-all duration-200 disabled:opacity-50 backdrop-blur-sm`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <AnimatePresence>
          {confirmPassword && confirmPassword === password && !errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-emerald-400 flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Passwords match
            </motion.p>
          )}
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.confirmPassword}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Terms & Conditions */}
      <div className="flex items-start gap-3 pt-2">
        <input
          id="terms"
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 mt-0.5 bg-white/5 border-white/10 rounded text-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-50"
        />
        <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer leading-relaxed">
          I agree to the{' '}
          <a href="/terms" target="_blank" className="text-amber-500 hover:text-amber-400 underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" target="_blank" className="text-amber-500 hover:text-amber-400 underline">
            Privacy Policy
          </a>
        </label>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading || !acceptedTerms}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none relative overflow-hidden group"
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </span>
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#1E293B] text-slate-500">Or sign up with</span>
        </div>
      </div>

      {/* Social Sign Up Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          type="button"
          disabled={isLoading}
          className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
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
          disabled={isLoading}
          className="flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
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

