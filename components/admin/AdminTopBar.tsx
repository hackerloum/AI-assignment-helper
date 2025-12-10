'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, User, Shield, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/cp/login');
  };

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

          {/* Title */}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            <h1 className="text-lg font-bold text-white hidden md:block">Admin Control Panel</h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User Profile */}
          <div className="relative">
            <motion.button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </motion.button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-64 bg-dashboard-elevated border border-dashboard-border rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-4 border-b border-dashboard-border">
                  <p className="text-sm font-semibold text-white">
                    {user?.user_metadata?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                    <Shield className="w-3 h-3" />
                    Administrator
                  </span>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

