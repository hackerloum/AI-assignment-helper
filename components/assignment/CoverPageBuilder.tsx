'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Users, Calendar, BookOpen, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CoverPageBuilderProps {
  assignmentType: 'individual' | 'group'
  templateId: string | null
  data: any
  onChange: (data: any) => void
}

export function CoverPageBuilder({ assignmentType, templateId, data, onChange }: CoverPageBuilderProps) {
  const [template, setTemplate] = useState<any>(null)
  const [formData, setFormData] = useState<any>(data || {})

  useEffect(() => {
    if (templateId) {
      loadTemplate()
    }
  }, [templateId])

  const loadTemplate = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('assignment_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error
      setTemplate(data)
    } catch (error: any) {
      console.error('Error loading template:', error)
      toast.error('Failed to load template')
    }
  }

  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    onChange(newData)
  }

  // Default fields if no template
  const defaultFields = assignmentType === 'individual' 
    ? [
        { key: 'college', label: 'College/School', icon: BookOpen },
        { key: 'department', label: 'Department', icon: BookOpen },
        { key: 'courseCode', label: 'Course Code', icon: BookOpen },
        { key: 'courseName', label: 'Course Name', icon: BookOpen },
        { key: 'title', label: 'Assignment Title', icon: BookOpen },
        { key: 'studentName', label: 'Student Name', icon: User },
        { key: 'registrationNumber', label: 'Registration Number', icon: UserCircle },
        { key: 'instructor', label: 'Instructor', icon: User },
        { key: 'submissionDate', label: 'Submission Date', icon: Calendar },
      ]
    : [
        { key: 'college', label: 'College/School', icon: BookOpen },
        { key: 'department', label: 'Department', icon: BookOpen },
        { key: 'courseCode', label: 'Course Code', icon: BookOpen },
        { key: 'courseName', label: 'Course Name', icon: BookOpen },
        { key: 'title', label: 'Assignment Title', icon: BookOpen },
        { key: 'groupName', label: 'Group Name', icon: Users },
        { key: 'instructor', label: 'Instructor', icon: User },
        { key: 'submissionDate', label: 'Submission Date', icon: Calendar },
      ]

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-3">Cover Page Information</h2>
      <p className="text-slate-400 mb-8">
        Fill in the details for your assignment cover page
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {defaultFields.map((field) => {
          const Icon = field.icon
          return (
            <div key={field.key}>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {field.label}
              </label>
              {field.key === 'submissionDate' ? (
                <input
                  type="date"
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className="w-full px-4 py-3 bg-white/5 border border-dashboard-border rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

