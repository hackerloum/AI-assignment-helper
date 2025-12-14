'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Users, User, Calendar, BookOpen } from 'lucide-react'
import { GroupMembersManager } from './GroupMembersManager'
import { createClient } from '@/lib/supabase/client'

interface CoverPageBuilderProps {
  assignmentType: 'individual' | 'group'
  templateId: string | null
  data: any
  onChange: (data: any) => void
}

export function CoverPageBuilder({ 
  assignmentType, 
  templateId, 
  data, 
  onChange 
}: CoverPageBuilderProps) {
  const [template, setTemplate] = useState<any>(null)
  const [formData, setFormData] = useState({
    // Common fields
    college_school: data.college_school || data.college || '',
    department: data.department || '',
    course_code: data.course_code || data.courseCode || '',
    course_name: data.course_name || data.courseName || '',
    assignment_title: data.assignment_title || data.title || '',
    instructor_name: data.instructor_name || data.instructor || '',
    submission_date: data.submission_date || '',
    
    // LGTI-specific fields
    program_name: data.program_name || '',
    module_name: data.module_name || '',
    module_code: data.module_code || '',
    type_of_work: data.type_of_work || '',
    group_number: data.group_number || '',
    task: data.task || '',
    
    // Individual fields
    student_name: data.student_name || data.studentName || '',
    registration_number: data.registration_number || data.registrationNumber || '',
    
    // Group fields
    group_name: data.group_name || data.groupName || '',
    group_representatives: data.group_representatives || [],
    group_members: data.group_members || [],
  })

  useEffect(() => {
    if (templateId) {
      loadTemplate()
    }
  }, [templateId])

  const loadTemplate = async () => {
    try {
      // Check if templateId is in CODE_TYPE format (DOCX template) or UUID (Supabase template)
      const templateIdMatch = templateId?.match(/^([A-Z0-9]+)_(individual|group)$/)
      
      if (templateIdMatch) {
        // DOCX template format: CODE_TYPE
        const code = templateIdMatch[1]
        const type = templateIdMatch[2]
        
        // For DOCX templates, we don't need to load from Supabase
        // Just set the template with the code information
        setTemplate({
          college_code: code,
          template_type: type,
          // DOCX templates don't have cover_page_format from Supabase
          // They use the actual DOCX file structure
        })
      } else {
        // Legacy Supabase template (UUID format)
        const supabase = createClient()
        const { data, error } = await supabase
          .from('assignment_templates')
          .select('*')
          .eq('id', templateId)
          .single()

        if (error) {
          console.error('Error loading template:', error)
          // Don't throw, just log - template might not exist in Supabase
          return
        }
        setTemplate(data)
      }
    } catch (error: any) {
      console.error('Error loading template:', error)
    }
  }

  // Detect if this is an LGTI template
  // LGTI templates use format: LGTI_individual or LGTI_group
  const isLGTI = template?.college_code === 'LGTI' || templateId?.startsWith('LGTI_')

  useEffect(() => {
    onChange(formData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {assignmentType === 'group' ? (
            <Users className="w-6 h-6 text-purple-400" />
          ) : (
            <User className="w-6 h-6 text-blue-400" />
          )}
          <h2 className="text-2xl font-bold text-white">
            {assignmentType === 'group' ? 'Group' : 'Individual'} Cover Page
          </h2>
        </div>
        <p className="text-slate-400">
          Fill in the details for your assignment cover page
        </p>
      </div>
      <div className="space-y-6">
        {/* Template-specific fields based on college and assignment type */}
        {/* LGTI Group Assignment - Special fields */}
        {isLGTI && assignmentType === 'group' ? (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Program Name"
                icon={BookOpen}
                value={formData.program_name}
                onChange={(value) => handleChange('program_name', value)}
                placeholder="e.g., Basic Technician Certificate in Community Development"
              />
              <FormField
                label="Module Name"
                icon={FileText}
                value={formData.module_name}
                onChange={(value) => handleChange('module_name', value)}
                placeholder="e.g., Basics of Entrepreneurship"
              />
              <FormField
                label="Module Code"
                icon={FileText}
                value={formData.module_code}
                onChange={(value) => handleChange('module_code', value)}
                placeholder="e.g., CDT 04211"
              />
              <FormField
                label="Type of Work"
                icon={FileText}
                value={formData.type_of_work}
                onChange={(value) => handleChange('type_of_work', value)}
                placeholder="e.g., GROUP ASSIGNMENT"
              />
            </div>
            <FormField
              label="Task"
              icon={FileText}
              value={formData.task}
              onChange={(value) => handleChange('task', value)}
              placeholder="e.g., Discuss seven (7) Entrepreneurs Myths"
              fullWidth
            />
          </>
        ) : isLGTI && assignmentType === 'individual' ? (
          <>
            {/* LGTI Individual Assignment - Special fields (ONLY for LGTI individual) */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="Course Name"
                icon={FileText}
                value={formData.course_name}
                onChange={(value) => handleChange('course_name', value)}
                placeholder="e.g., Public Administration"
              />
              <FormField
                label="Module Code"
                icon={FileText}
                value={formData.module_code}
                onChange={(value) => handleChange('module_code', value)}
                placeholder="e.g., PA101"
              />
              <FormField
                label="Module Name"
                icon={FileText}
                value={formData.module_name}
                onChange={(value) => handleChange('module_name', value)}
                placeholder="e.g., Introduction to Public Administration"
              />
              <FormField
                label="Type of Work"
                icon={FileText}
                value={formData.type_of_work}
                onChange={(value) => handleChange('type_of_work', value)}
                placeholder="e.g., INDIVIDUAL ASSIGNMENT"
              />
            </div>
            <FormField
              label="Question"
              icon={FileText}
              value={formData.task}
              onChange={(value) => handleChange('task', value)}
              placeholder="e.g., Explain the role of local government in community development"
              fullWidth
            />
          </>
        ) : (
          <>
            {/* Common Fields - For all other colleges (non-LGTI) */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                label="College/School"
                icon={BookOpen}
                value={formData.college_school}
                onChange={(value) => handleChange('college_school', value)}
                placeholder="e.g., College of Information and Communication Technologies"
              />
              <FormField
                label="Department"
                icon={FileText}
                value={formData.department}
                onChange={(value) => handleChange('department', value)}
                placeholder="e.g., Computer Science and Engineering"
              />
              <FormField
                label="Course Code"
                icon={FileText}
                value={formData.course_code}
                onChange={(value) => handleChange('course_code', value)}
                placeholder="e.g., CS 301"
              />
              <FormField
                label="Course Name"
                icon={FileText}
                value={formData.course_name}
                onChange={(value) => handleChange('course_name', value)}
                placeholder="e.g., Software Engineering"
              />
            </div>
            <FormField
              label="Assignment Title"
              icon={FileText}
              value={formData.assignment_title}
              onChange={(value) => handleChange('assignment_title', value)}
              placeholder="e.g., Database Management Systems Analysis"
              fullWidth
            />
          </>
        )}

        {/* Individual-specific fields */}
        {assignmentType === 'individual' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-4 p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl"
          >
            <FormField
              label={isLGTI ? "Name of Student" : "Your Full Name"}
              icon={User}
              value={formData.student_name}
              onChange={(value) => handleChange('student_name', value)}
              placeholder="e.g., John Doe"
            />
            <FormField
              label="Registration Number"
              icon={FileText}
              value={formData.registration_number}
              onChange={(value) => handleChange('registration_number', value)}
              placeholder={isLGTI ? "e.g., LGTI/2024/001" : "e.g., 2020-04-12345"}
            />
          </motion.div>
        )}

        {/* Group-specific fields */}
        {assignmentType === 'group' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl"
          >
            {isLGTI ? (
              <FormField
                label="Group Number"
                icon={Users}
                value={formData.group_number}
                onChange={(value) => handleChange('group_number', value)}
                placeholder="e.g., 18"
              />
            ) : (
              <FormField
                label="Group Name"
                icon={Users}
                value={formData.group_name}
                onChange={(value) => handleChange('group_name', value)}
                placeholder="e.g., Tech Innovators"
              />
            )}
            <GroupMembersManager
              representatives={formData.group_representatives}
              members={formData.group_members}
              onRepresentativesChange={(reps) => handleChange('group_representatives', reps)}
              onMembersChange={(members) => handleChange('group_members', members)}
              showPhoneNumber={isLGTI}
            />
          </motion.div>
        )}

        {/* Additional Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            label={isLGTI && assignmentType === 'individual' ? "Lecture Name" : "Instructor Name"}
            icon={User}
            value={formData.instructor_name}
            onChange={(value) => handleChange('instructor_name', value)}
            placeholder={isLGTI && assignmentType === 'individual' ? "e.g., Dr. John Smith" : "e.g., Dr. Jane Smith"}
          />
          <FormField
            label="Submission Date"
            icon={Calendar}
            type="date"
            value={formData.submission_date}
            onChange={(value) => handleChange('submission_date', value)}
          />
        </div>
      </div>
    </div>
  )
}

// Form Field Component
interface FormFieldProps {
  label: string
  icon: any
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  fullWidth?: boolean
}

function FormField({ 
  label, 
  icon: Icon, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  fullWidth = false 
}: FormFieldProps) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <label className="block text-sm font-semibold text-slate-300 mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {label}
        </div>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
      />
    </div>
  )
}
