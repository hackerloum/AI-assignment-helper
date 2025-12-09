'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1E293B] to-[#0A0E27] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      
      <motion.div 
        className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, delay: 2 }}
      />

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

