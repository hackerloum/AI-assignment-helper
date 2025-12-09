'use client'

import { motion } from 'framer-motion'
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'FAQ', href: '#faq' },
    ],
    tools: [
      { label: 'AI Research', href: '/tools/essay' },
      { label: 'Grammar Checker', href: '/tools/grammar' },
      { label: 'Plagiarism Checker', href: '/tools/paraphrase' },
      { label: 'APA Citations', href: '/tools/citation' },
      { label: 'Text Summarizer', href: '/tools/summarize' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Student Guide', href: '/guide' },
      { label: 'Payment Methods', href: '/payments' },
      { label: 'Refund Policy', href: '/refunds' },
    ],
  }

  return (
    <footer className="bg-navy-950 text-white">
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          <motion.div 
            className="col-span-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <span className="text-xl font-bold">Assignment Helper</span>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              Your AI-powered academic assistant. Helping Tanzanian college students 
              excel in their studies with powerful AI tools.
            </p>
            
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors border border-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-semibold text-white mb-4">Tools</h3>
            <ul className="space-y-3">
              {footerLinks.tools.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div 
          className="border-t border-white/10 pt-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Location</div>
                <div className="text-slate-400 text-sm">Dar es Salaam, Tanzania</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Email</div>
                <a 
                  href="mailto:support@aiassignmenthelper.com"
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  support@aiassignmenthelper.com
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold mb-1">Phone</div>
                <a 
                  href="tel:+255123456789"
                  className="text-slate-400 text-sm hover:text-white transition-colors"
                >
                  +255 123 456 789
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-slate-400 text-sm">
            © {currentYear} AI Assignment Helper. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

