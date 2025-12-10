'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  FileText, 
  Settings,
  ChevronLeft,
  Shield,
  LogOut,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AdminSidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    name: 'Overview',
    href: '/cp',
    icon: LayoutDashboard,
    color: 'text-blue-400',
  },
  {
    name: 'Analytics',
    href: '/cp',
    icon: BarChart3,
    color: 'text-purple-400',
  },
  {
    name: 'Users',
    href: '/cp?tab=users',
    icon: Users,
    color: 'text-emerald-400',
  },
  {
    name: 'Payments',
    href: '/cp?tab=payments',
    icon: DollarSign,
    color: 'text-amber-400',
  },
  {
    name: 'Submissions',
    href: '/cp?tab=submissions',
    icon: FileText,
    color: 'text-indigo-400',
  },
  {
    name: 'Settings',
    href: '/cp?tab=settings',
    icon: Settings,
    color: 'text-slate-400',
  },
];

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    router.push('/cp/login');
  };

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
              <Link href="/cp" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">Control Panel</span>
              </Link>
            ) : (
              <Link href="/cp" className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
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

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href || (item.href === '/cp' && pathname === '/cp')}
                collapsed={!open}
              />
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
  );
}

// Nav Item Component
interface NavItemProps {
  item: any;
  isActive: boolean;
  collapsed: boolean;
}

function NavItem({ item, isActive, collapsed }: NavItemProps) {
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <motion.div
        className={`flex items-center gap-3 py-2 rounded-lg transition-colors relative group ${
          isActive
            ? 'bg-sidebar-item-active text-amber-400 pl-4 pr-3'
            : 'text-slate-400 hover:bg-sidebar-item-hover hover:text-white px-3'
        } ${collapsed && 'justify-center px-3'}`}
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
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-400' : item.color}`} />
        
        {!collapsed && (
          <span className={`text-sm font-medium flex-1 ${isActive ? 'text-amber-400' : ''}`}>
            {item.name}
          </span>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-dashboard-elevated border border-dashboard-border rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            <span className="text-sm text-white">{item.name}</span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

