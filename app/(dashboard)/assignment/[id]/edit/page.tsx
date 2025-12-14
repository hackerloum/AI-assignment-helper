'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Save,
  Loader2,
  FileText,
  User,
  Sparkles,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CoverPageBuilder } from '@/components/assignment/CoverPageBuilder'
import { ContentEditor } from '@/components/assignment/ContentEditor'
import { AssignmentPreview } from '@/components/assignment/AssignmentPreview'

type Step = 'cover' | 'content' | 'preview'

export default function EditAssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string
  const [currentStep, setCurrentStep] = useState<Step>('cover')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [assignment, setAssignment] = useState<any>(null)
  const [assignmentData, setAssignmentData] = useState<any>({
    type: null,
    method: 'template',
    templateId: null,
    coverPageData: {},
    content: '',
    references: [],
  })

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'cover', label: 'Cover Page', icon: FileText },
    { id: 'content', label: 'Content', icon: Sparkles },
    { id: 'preview', label: 'Preview', icon: Check },
  ]

  useEffect(() => {
    loadAssignment()
  }, [assignmentId])

  const loadAssignment = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }

      const { data, error } = await supabase
        .from('assignments_new')
        .select('*')
        .eq('id', assignmentId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      
      setAssignment(data)
      
      // Map database fields to form data
      const templateId = data.template_code && data.template_type 
        ? `${data.template_code}_${data.template_type}`
        : data.template_id

      setAssignmentData({
        type: data.assignment_type,
        method: 'template',
        templateId: templateId,
        coverPageData: {
          // Basic fields
          college_school: data.college_school || '',
          department: data.department || '',
          course_code: data.course_code || '',
          course_name: data.course_name || '',
          assignment_title: data.title || '',
          instructor_name: data.instructor_name || '',
          submission_date: data.submission_date || '',
          
          // LGTI-specific fields
          program_name: data.program_name || '',
          module_name: data.module_name || '',
          module_code: data.module_code || '',
          type_of_work: data.type_of_work || '',
          task: data.task || '',
          group_number: data.group_number || '',
          
          // Individual fields
          student_name: data.student_name || '',
          registration_number: data.registration_number || '',
          
          // Group fields
          group_name: data.group_name || '',
          group_representatives: data.group_representatives || [],
          group_members: data.group_members || [],
        },
        content: data.assignment_content || '',
        references: data.assignment_references || [],
      })
    } catch (error: any) {
      console.error('Error loading assignment:', error)
      toast.error('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        return
      }

      // Calculate word count
      const wordCount = assignmentData.content ? assignmentData.content.split(/\s+/).filter(Boolean).length : 0

      // Prepare update data
      const updateData: any = {
        title: assignmentData.coverPageData.assignment_title || assignmentData.coverPageData.title || assignment.title,
        course_code: assignmentData.coverPageData.course_code || assignmentData.coverPageData.module_code,
        course_name: assignmentData.coverPageData.course_name || assignmentData.coverPageData.module_name,
        instructor_name: assignmentData.coverPageData.instructor_name || assignmentData.coverPageData.lecture_name,
        submission_date: assignmentData.coverPageData.submission_date || null,
        assignment_content: assignmentData.content.trim(),
        assignment_references: Array.isArray(assignmentData.references) ? assignmentData.references : [],
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      }

      // Add LGTI-specific fields
      if (assignmentData.coverPageData.program_name) {
        updateData.program_name = assignmentData.coverPageData.program_name
      }
      if (assignmentData.coverPageData.module_name) {
        updateData.module_name = assignmentData.coverPageData.module_name
      }
      if (assignmentData.coverPageData.module_code) {
        updateData.module_code = assignmentData.coverPageData.module_code
      }
      if (assignmentData.coverPageData.type_of_work) {
        updateData.type_of_work = assignmentData.coverPageData.type_of_work
      }
      if (assignmentData.coverPageData.task) {
        updateData.task = assignmentData.coverPageData.task
      }
      if (assignmentData.coverPageData.group_number) {
        updateData.group_number = assignmentData.coverPageData.group_number
      }

      // Add type-specific fields
      if (assignmentData.type === 'individual') {
        updateData.student_name = assignmentData.coverPageData.student_name || null
        updateData.registration_number = assignmentData.coverPageData.registration_number || null
      } else if (assignmentData.type === 'group') {
        updateData.group_name = assignmentData.coverPageData.group_name || null
        updateData.group_representatives = Array.isArray(assignmentData.coverPageData.group_representatives) 
          ? assignmentData.coverPageData.group_representatives 
          : []
        updateData.group_members = Array.isArray(assignmentData.coverPageData.group_members) 
          ? assignmentData.coverPageData.group_members 
          : []
      }

      // Update via API
      const response = await fetch(`/api/assignment/update`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          assignmentId,
          ...updateData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle credit-related errors
        if (errorData.requiresCredits || response.status === 402) {
          toast.error(
            errorData.error || 'Insufficient credits',
            {
              duration: 5000,
              description: `You need ${errorData.creditCost || 5} credits but only have ${errorData.remainingCredits || 0} credits.`
            }
          )
          return
        }
        
        throw new Error(errorData.error || 'Failed to update assignment')
      }

      const responseData = await response.json()
      
      // Check if credits were charged (would be in edit history)
      toast.success('Assignment updated successfully!')
      
      // Reload assignment data
      await loadAssignment()
      
      // Move to preview
      setCurrentStep('preview')
    } catch (error: any) {
      console.error('Error saving assignment:', error)
      toast.error(error.message || 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-slate-400">Assignment not found</p>
        <Link href="/assignment" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
          Back to Assignments
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/assignment/${assignmentId}`}>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Assignment</h1>
            <p className="text-slate-400">Step {currentStepIndex + 1} of {steps.length}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="space-y-4">
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index < currentStepIndex
              const isCurrent = index === currentStepIndex
              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-indigo-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-500/20 text-indigo-400 border-2 border-indigo-500'
                      : 'bg-white/5 text-slate-500'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center hidden md:block ${
                    isCurrent ? 'text-white' : 'text-slate-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 'cover' && (
            <CoverPageBuilder
              assignmentType={assignmentData.type}
              templateId={assignmentData.templateId}
              data={assignmentData.coverPageData}
              onChange={(coverPageData) => {
                setAssignmentData({ ...assignmentData, coverPageData })
              }}
            />
          )}

          {currentStep === 'content' && (
            <div className="space-y-4">
              {/* Credit Warning */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-300 mb-1">
                      Credit Charges for Significant Edits
                    </h4>
                    <p className="text-xs text-amber-200/80">
                      If you change more than 30% of the content, <strong>5 credits will be charged</strong>. 
                      Minor edits (cover page, formatting) are free. Downloading edited assignments costs <strong>3 credits</strong> per download.
                    </p>
                  </div>
                </div>
              </div>
              <ContentEditor
                assignmentType={assignmentData.type!}
                content={assignmentData.content}
                references={assignmentData.references}
                onChange={(content, references) => {
                  setAssignmentData({ ...assignmentData, content, references })
                }}
              />
            </div>
          )}

          {currentStep === 'preview' && (
            <AssignmentPreview
              data={assignmentData}
              assignmentId={assignmentId}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStepIndex === 0}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        {currentStep === 'content' ? (
          <motion.button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-50"
            whileHover={{ scale: saving ? 1 : 1.05 }}
            whileTap={{ scale: saving ? 1 : 0.95 }}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </motion.button>
        ) : currentStep === 'preview' ? (
          <Link href={`/assignment/${assignmentId}`}>
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
              <Check className="w-5 h-5" />
              Done
            </button>
          </Link>
        ) : (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

