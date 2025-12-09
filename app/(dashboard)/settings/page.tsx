'use client'

import { motion } from 'framer-motion'
import { Settings, User, Bell, Lock, Palette } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser()
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || user.user_metadata?.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      })

      if (error) throw error

      toast.success('Settings saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-slate-500/10 rounded-xl">
            <Settings className="w-6 h-6 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-slate-400">
          Manage your account preferences and settings
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Profile</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={userLoading || saving}
              className="w-full px-4 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-white opacity-50 cursor-not-allowed"
              placeholder="Email cannot be changed"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed for security reasons</p>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-sm text-slate-400">Receive updates via email</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                emailNotifications ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                animate={{ x: emailNotifications ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Appearance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Dark Mode</h3>
              <p className="text-sm text-slate-400">Use dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                darkMode ? 'bg-amber-500' : 'bg-slate-600'
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"
                animate={{ x: darkMode ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-semibold text-white">Security</h2>
        </div>
        
        <div className="space-y-3">
          <button className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-lg text-left text-white hover:border-amber-500 transition-colors">
            Change Password
          </button>
          <button className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-lg text-left text-white hover:border-amber-500 transition-colors">
            Enable Two-Factor Authentication
          </button>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.button
        onClick={handleSave}
        disabled={saving || userLoading}
        className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={saving ? {} : { scale: 1.02 }}
        whileTap={saving ? {} : { scale: 0.98 }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </motion.button>
    </div>
  )
}

