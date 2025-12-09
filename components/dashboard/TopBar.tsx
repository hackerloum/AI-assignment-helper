'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Menu, 
  Command,
  User,
  ChevronDown
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface TopBarProps {
  onMenuClick: () => void
  onCommandClick: () => void
}

export function TopBar({ onMenuClick, onCommandClick }: TopBarProps) {
  const { user } = useUser()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-dashboard-bg/80 backdrop-blur-xl border-b border-dashboard-border">
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </button>

          {/* Breadcrumb - Hidden on mobile */}
          <div className="hidden md:block">
            <Breadcrumb />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Command Palette Button */}
          <motion.button
            onClick={onCommandClick}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-dashboard-border rounded-lg transition-colors group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-sm text-slate-400 group-hover:text-white transition-colors">
              Search...
            </span>
            <div className="flex items-center gap-0.5 ml-2">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-slate-400">
                <Command className="w-3 h-3" />
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-slate-400">
                K
              </kbd>
            </div>
          </motion.button>

          {/* Mobile Search Button */}
          <button
            onClick={onCommandClick}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Search className="w-5 h-5 text-slate-400" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <motion.button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5 text-slate-400" />
              {/* Notification badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-80 bg-dashboard-elevated border border-dashboard-border rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-dashboard-border">
                  <h3 className="font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {/* Notification items */}
                  <div className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">
                          Your subscription will expire in 3 days
                        </p>
                        <p className="text-xs text-slate-500">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">
                          Research completed successfully
                        </p>
                        <p className="text-xs text-slate-500">5 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-t border-dashboard-border text-center">
                  <button className="text-sm text-amber-400 hover:text-amber-300 font-medium">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
            </motion.button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-64 bg-dashboard-elevated border border-dashboard-border rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-dashboard-border">
                  <p className="text-sm font-semibold text-white">
                    {user?.user_metadata?.full_name || 'Student'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                    Billing
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

