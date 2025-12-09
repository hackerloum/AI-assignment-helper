'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface LegalSectionProps {
  id: string
  title: string
  isActive: boolean
  children: React.ReactNode
}

export function LegalSection({ id, title, isActive, children }: LegalSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isActive && sectionRef.current) {
      // Optionally highlight active section
    }
  }, [isActive])

  return (
    <motion.section
      ref={sectionRef}
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      className="scroll-mt-24"
    >
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          {title}
        </h2>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </motion.section>
  )
}

