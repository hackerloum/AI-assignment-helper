'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  RefreshCw, 
  Shield, 
  FileCode, 
  Presentation,
  History,
  CreditCard,
  Settings,
  ChevronLeft,
  Sparkles,
  LogOut
} from 'lucide-react'
import { CreditCounter } from './CreditCounter'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-blue-400',
  },
  {
    name: 'AI Tools',
    items: [
      {
        name: 'Research Assistant',
        href: '/research',
        icon: FileText,
        color: 'text-blue-400',
        badge: 'AI',
      },
      {
        name: 'Grammar & Rewrite',
        href: '/rewrite',
        icon: RefreshCw,
        color: 'text-purple-400',
        badge: 'AI',
      },
      {
        name: 'Plagiarism Check',
        href: '/plagiarism',
        icon: Shield,
        color: 'text-emerald-400',
        badge: 'AI',
      },
      {
        name: 'APA Referencing',
        href: '/referencing',
        icon: FileCode,
        color: 'text-amber-400',
        badge: 'AI',
      },
      {
        name: 'PowerPoint Maker',
        href: '/powerpoint',
        icon: Presentation,
        color: 'text-pink-400',
        badge: 'AI',
      },
    ],
  },
  {
    name: 'Account',
    items: [
      {
        name: 'Usage History',
        href: '/history',
        icon: History,
        color: 'text-slate-400',
      },
      {
        name: 'Subscription',
        href: '/subscription',
        icon: CreditCard,
        color: 'text-slate-400',
      },
      {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        color: 'text-slate-400',
      },
    ],
  },
]

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logged out successfully')
    router.push('/')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 h-screen bg-sidebar-bg border-r border-dashboard-border z-40 hidden lg:block ${
          open ? 'w-64' : 'w-20'
        }`}
        animate={{ width: open ? 256 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-dashboard-border">
            {open ? (
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">Assignment Helper</span>
              </Link>
            ) : (
              <Link href="/dashboard" className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}
            
            {open && (
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>

          {/* Credit Counter */}
          {open && (
            <div className="p-4 border-b border-dashboard-border">
              <CreditCounter />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navigation.map((section, idx) => (
              <div key={idx}>
                {section.name !== 'Dashboard' && open && (
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                    {section.name}
                  </h3>
                )}
                <div className="space-y-1">
                  {section.href ? (
                    <NavItem
                      item={section}
                      isActive={pathname === section.href}
                      collapsed={!open}
                    />
                  ) : (
                    section.items?.map((item) => (
                      <NavItem
                        key={item.href}
                        item={item}
                        isActive={pathname === item.href}
                        collapsed={!open}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-dashboard-border">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors ${
                !open && 'justify-center'
              }`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {open && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Collapse Button (when sidebar is collapsed) */}
      {!open && (
        <button
          onClick={onToggle}
          className="hidden lg:block fixed left-20 top-4 z-50 p-2 bg-dashboard-elevated border border-dashboard-border rounded-lg hover:bg-dashboard-surface transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-400 rotate-180" />
        </button>
      )}
    </>
  )
}

// Nav Item Component
interface NavItemProps {
  item: any
  isActive: boolean
  collapsed: boolean
}

function NavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon

  return (
    <Link href={item.href}>
      <motion.div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative group ${
          isActive
            ? 'bg-sidebar-item-active text-amber-400'
            : 'text-slate-400 hover:bg-sidebar-item-hover hover:text-white'
        } ${collapsed && 'justify-center'}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full"
            layoutId="activeIndicator"
          />
        )}
        <Icon className={`w-5 h-5 flex-shrink-0 ${item.color}`} />
        
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1">{item.name}</span>
            {item.badge && (
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded">
                {item.badge}
              </span>
            )}
          </>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-dashboard-elevated border border-dashboard-border rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
            <span className="text-sm text-white">{item.name}</span>
          </div>
        )}
      </motion.div>
    </Link>
  )
}

