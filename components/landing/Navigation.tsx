'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Quick Tools', href: '#quick-tools' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-navy-950/95 backdrop-blur-xl border-b border-white/10 shadow-lg'
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 z-50">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-white font-bold text-xl hidden sm:inline">
                Assignment Helper
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                  whileHover={{ y: -2 }}
                  onClick={(e) => {
                    e.preventDefault()
                    const element = document.querySelector(link.href)
                    element?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>

             {/* CTA Buttons */}
             <div className="hidden md:flex items-center gap-4">
               <Link href="/auth/signin">
                 <motion.button
                   className="px-6 py-2.5 text-white hover:text-slate-300 transition-colors font-semibold"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   Sign In
                 </motion.button>
               </Link>
               <Link href="/auth/signup">
                 <motion.button
                   className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/30"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   Get Started
                 </motion.button>
               </Link>
             </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white z-50"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className={`fixed inset-0 bg-navy-950 z-40 md:hidden ${
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 px-6">
          {navLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              className="text-3xl font-bold text-white hover:text-amber-400 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isMobileMenuOpen ? 1 : 0,
                y: isMobileMenuOpen ? 0 : 20,
              }}
              transition={{ delay: index * 0.1 }}
              onClick={(e) => {
                e.preventDefault()
                const element = document.querySelector(link.href)
                element?.scrollIntoView({ behavior: 'smooth' })
                setIsMobileMenuOpen(false)
              }}
            >
              {link.label}
            </motion.a>
          ))}
          
          <div className="flex flex-col gap-4 w-full max-w-xs mt-8">
            <Link href="/auth/signin" className="w-full">
              <motion.button
                className="w-full px-8 py-4 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </motion.button>
            </Link>
            <Link href="/auth/signup" className="w-full">
              <motion.button
                className="w-full px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-lg"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  )
}

