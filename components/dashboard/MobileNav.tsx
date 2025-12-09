'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  RefreshCw, 
  Shield, 
  FileCode, 
  Presentation,
  X
} from 'lucide-react'

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Research', href: '/research', icon: FileText },
  { name: 'Rewrite', href: '/rewrite', icon: RefreshCw },
  { name: 'Plagiarism', href: '/plagiarism', icon: Shield },
  { name: 'Referencing', href: '/referencing', icon: FileCode },
  { name: 'PowerPoint', href: '/powerpoint', icon: Presentation },
]

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-64 bg-sidebar-bg border-r border-dashboard-border z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-dashboard-border">
                <h2 className="font-bold text-white text-lg">Assignment Helper</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <motion.div
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </motion.div>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

