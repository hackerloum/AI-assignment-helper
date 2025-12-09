'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  FileText, 
  RefreshCw, 
  Shield, 
  FileCode, 
  Presentation,
  Settings,
  CreditCard,
  History,
  Command,
  type LucideIcon
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

interface CommandItem {
  name: string
  href: string
  icon: LucideIcon
  shortcut?: string
}

interface CommandCategory {
  category: string
  items: CommandItem[]
}

const commands: CommandCategory[] = [
  {
    category: 'AI Tools',
    items: [
      { name: 'Research Assistant', href: '/research', icon: FileText, shortcut: 'R' },
      { name: 'Grammar & Rewrite', href: '/rewrite', icon: RefreshCw, shortcut: 'W' },
      { name: 'Plagiarism Checker', href: '/plagiarism', icon: Shield, shortcut: 'P' },
      { name: 'APA Referencing', href: '/referencing', icon: FileCode, shortcut: 'A' },
      { name: 'PowerPoint Maker', href: '/powerpoint', icon: Presentation, shortcut: 'S' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { name: 'Usage History', href: '/history', icon: History },
      { name: 'Subscription', href: '/subscription', icon: CreditCard },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter commands based on search
  const filteredCommands = commands.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(category => category.items.length > 0)

  // Flatten for keyboard navigation
  const allItems = filteredCommands.flatMap(cat => cat.items)

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % allItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = allItems[selectedIndex]
        if (selected) {
          router.push(selected.href)
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedIndex, allItems, router, onClose])

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
    setSearch('')
    setSelectedIndex(0)
  }, [open])

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-2xl bg-dashboard-elevated border border-dashboard-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-dashboard-border">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for tools, pages, or actions..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-slate-500"
                />
                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-400">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-slate-500">No results found</p>
                  </div>
                ) : (
                  filteredCommands.map((category, catIndex) => (
                    <div key={category.category} className="px-2 py-2">
                      <div className="px-3 py-2">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {category.category}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {category.items.map((item, itemIndex) => {
                          const globalIndex = filteredCommands
                            .slice(0, catIndex)
                            .reduce((acc, cat) => acc + cat.items.length, 0) + itemIndex
                          const isSelected = globalIndex === selectedIndex
                          const Icon = item.icon

                          return (
                            <motion.button
                              key={item.name}
                              onClick={() => {
                                router.push(item.href)
                                onClose()
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                isSelected
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'text-slate-300 hover:bg-white/5'
                              }`}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="flex-1 text-left text-sm">{item.name}</span>
                              {item.shortcut && (
                                <kbd className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-slate-400">
                                  {item.shortcut}
                                </kbd>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-dashboard-border bg-dashboard-bg/50">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↵</kbd>
                    <span>Select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Command className="w-3 h-3" />
                  <span>Command Palette</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

