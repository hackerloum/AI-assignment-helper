'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'
import { TopBar } from '@/components/dashboard/TopBar'
import { CommandPalette } from '@/components/dashboard/CommandPalette'
import { Toaster } from 'sonner'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
  const router = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(true)
  const [hasPaid, setHasPaid] = useState<boolean | null>(null)
  const pathname = usePathname()

  // Check payment status
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!user) {
        setCheckingPayment(false)
        return
      }

      try {
        // Get session token
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          setCheckingPayment(false)
          return
        }

        const response = await fetch('/api/payments/check-status', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setHasPaid(data.hasPaid || false)
        } else {
          setHasPaid(false)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setHasPaid(false)
      } finally {
        setCheckingPayment(false)
      }
    }

    if (!loading && user) {
      checkPaymentStatus()
    } else if (!loading && !user) {
      setCheckingPayment(false)
    }
  }, [user, loading, supabase])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user && !checkingPayment) {
      router.push('/login')
    }
  }, [user, loading, checkingPayment, router])

  // Redirect if not paid
  useEffect(() => {
    if (!checkingPayment && user && hasPaid === false) {
      router.push('/one-time-payment')
    }
  }, [hasPaid, checkingPayment, user, router])

  // Command palette keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (loading || checkingPayment) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-slate-400">
            {checkingPayment ? 'Verifying payment status...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if user hasn't paid
  if (user && hasPaid === false) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Sidebar - Desktop */}
      <Sidebar 
        open={sidebarOpen} 
        onToggle={() => setSidebarOpen(!sidebarOpen)} 
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        {/* Top Bar */}
        <TopBar 
          onMenuClick={() => setMobileMenuOpen(true)}
          onCommandClick={() => setCommandPaletteOpen(true)}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
      />

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </div>
  )
}

