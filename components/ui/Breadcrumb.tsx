'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumb() {
  const pathname = usePathname()
  
  // Generate breadcrumb items from pathname
  const segments = pathname.split('/').filter(Boolean)
  
  // Map segment to readable name
  const getSegmentName = (segment: string) => {
    const names: Record<string, string> = {
      dashboard: 'Dashboard',
      research: 'Research Assistant',
      rewrite: 'Grammar & Rewrite',
      plagiarism: 'Plagiarism Checker',
      referencing: 'APA Referencing',
      powerpoint: 'PowerPoint Maker',
      history: 'Usage History',
      subscription: 'Subscription',
      settings: 'Settings',
    }
    return names[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link 
        href="/dashboard"
        className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const isLast = index === segments.length - 1
        
        return (
          <div key={segment} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-slate-600" />
            {isLast ? (
              <span className="font-medium text-white">
                {getSegmentName(segment)}
              </span>
            ) : (
              <Link
                href={href}
                className="text-slate-400 hover:text-white transition-colors"
              >
                {getSegmentName(segment)}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

