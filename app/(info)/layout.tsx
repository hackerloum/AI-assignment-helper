'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 text-white hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-bold text-lg">AI Assignment Helper</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} AI Assignment Helper. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/terms" className="text-slate-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-slate-500 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

