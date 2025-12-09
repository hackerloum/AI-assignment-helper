'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, Check } from 'lucide-react'

interface PasswordStrength {
  score: number
  label: string
  color: string
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
  }
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
    }

    const score = Object.values(checks).filter(Boolean).length

    let label = 'Weak'
    let color = 'red'

    if (score >= 3) {
      label = 'Strong'
      color = 'emerald'
    } else if (score >= 2) {
      label = 'Medium'
      color = 'amber'
    }

    return { score, label, color, checks }
  }

  const passwordStrength = password ? calculatePasswordStrength(password) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Failed to reset password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Create new password
          </h1>
          <p className="text-slate-400">
            Enter a new password for your account
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
              Password reset successful!
            </h2>
            <p className="text-slate-400 mb-4">
              Redirecting you to login...
            </p>
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

            {/* New Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors ${
                    password ? 'text-amber-500' : 'text-slate-500'
                  }`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 focus:border-amber-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          passwordStrength.color === 'emerald' ? 'bg-emerald-500' :
                          passwordStrength.color === 'amber' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
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

                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { key: 'length', label: '8+ characters' },
                      { key: 'uppercase', label: 'Uppercase' },
                      { key: 'lowercase', label: 'Lowercase' },
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
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors ${
                    confirmPassword && confirmPassword === password ? 'text-emerald-500' : 'text-slate-500'
                  }`} />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  disabled={isLoading}
                  className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border ${
                    confirmPassword && confirmPassword === password
                      ? 'border-emerald-500/50 focus:border-emerald-500'
                      : 'border-white/10 focus:border-amber-500'
                  } rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
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
                {confirmPassword && confirmPassword === password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-emerald-400 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Passwords match
                  </motion.p>
                )}
              </AnimatePresence>
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
                    Resetting password...
                  </>
                ) : (
                  'Reset password'
                )}
              </span>
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  )
}

