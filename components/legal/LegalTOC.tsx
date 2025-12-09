'use client'

import { motion } from 'framer-motion'
import { List } from 'lucide-react'

interface Section {
  id: string
  title: string
}

interface LegalTOCProps {
  sections: Section[]
  activeSection: string
  onSectionClick: (id: string) => void
}

export function LegalTOC({ sections, activeSection, onSectionClick }: LegalTOCProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    onSectionClick(id)
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-white">Table of Contents</h3>
      </div>
      <nav className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
              activeSection === section.id
                ? 'bg-amber-500/10 text-amber-400 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {section.title}
          </button>
        ))}
      </nav>
    </div>
  )
}

