'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Upload,
  FileText,
  Users,
  User,
  Sparkles,
  Download,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { AssignmentTypeSelector } from '@/components/assignment/AssignmentTypeSelector'
import { TemplateSelector } from '@/components/assignment/TemplateSelector'
import { SampleUploader } from '@/components/assignment/SampleUploader'
import { CoverPageBuilder } from '@/components/assignment/CoverPageBuilder'
import { GroupMembersManager } from '@/components/assignment/GroupMembersManager'
import { ContentEditor } from '@/components/assignment/ContentEditor'
import { AssignmentPreview } from '@/components/assignment/AssignmentPreview'
import { toast } from 'sonner'

type Step = 
  | 'type' 
  | 'method' 
  | 'template' 
  | 'upload' 
  | 'cover' 
  | 'content' 
  | 'preview'

interface AssignmentData {
  type: 'individual' | 'group' | null
  method: 'template' | 'sample' | null
  templateId: string | null
  customTemplateId: string | null
  coverPageData: any
  content: string
  references: any[]
}

export default function NewAssignmentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const typeParam = searchParams.get('type') as 'individual' | 'group' | null
  const [currentStep, setCurrentStep] = useState<Step>('type')
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    type: typeParam,
    method: null,
    templateId: null,
    customTemplateId: null,
    coverPageData: {},
    content: '',
    references: [],
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedId, setGeneratedId] = useState<string | null>(null)

  const steps: { id: Step; label: string; icon: any }[] = [
    { id: 'type', label: 'Assignment Type', icon: FileText },
    { id: 'method', label: 'Choose Method', icon: Upload },
    { id: 'template', label: 'Select Template', icon: FileText },
    { id: 'cover', label: 'Cover Page', icon: User },
    { id: 'content', label: 'Content', icon: Sparkles },
    { id: 'preview', label: 'Preview', icon: Check },
  ]

  // Filter steps based on method
  const activeSteps = steps.filter(step => {
    if (assignmentData.method === 'template' && step.id === 'upload') return false
    if (assignmentData.method === 'sample' && step.id === 'template') return false
    return true
  })

  const currentStepIndex = activeSteps.findIndex(s => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / activeSteps.length) * 100

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < activeSteps.length) {
      setCurrentStep(activeSteps[nextIndex].id)
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(activeSteps[prevIndex].id)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setIsGenerating(false)
        return
      }

      const response = await fetch('/api/assignment/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify(assignmentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate assignment')
      }

      const data = await response.json()
      setGeneratedId(data.assignmentId)
      toast.success('Assignment generated successfully!')
      
      // Move to preview
      setCurrentStep('preview')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-advance to method step if type is already selected
  useEffect(() => {
    if (typeParam && currentStep === 'type') {
      setCurrentStep('method')
    }
  }, [typeParam, currentStep])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assignment">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Assignment</h1>
            <p className="text-slate-400">Step {currentStepIndex + 1} of {activeSteps.length}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="space-y-4">
          {/* Progress indicator */}
          <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {/* Steps */}
          <div className="flex justify-between">
            {activeSteps.map((step, index) => {
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
          {currentStep === 'type' && (
            <AssignmentTypeSelector
              value={assignmentData.type}
              onChange={(type) => {
                setAssignmentData({ ...assignmentData, type })
                handleNext()
              }}
            />
          )}

          {currentStep === 'method' && (
            <MethodSelector
              value={assignmentData.method}
              onChange={(method) => {
                setAssignmentData({ ...assignmentData, method })
                handleNext()
              }}
            />
          )}

          {currentStep === 'template' && assignmentData.method === 'template' && (
            <TemplateSelector
              assignmentType={assignmentData.type!}
              selectedId={assignmentData.templateId}
              onSelect={(templateId) => {
                setAssignmentData({ ...assignmentData, templateId })
              }}
            />
          )}

          {currentStep === 'upload' && assignmentData.method === 'sample' && (
            <SampleUploader
              onUploadComplete={(customTemplateId) => {
                setAssignmentData({ ...assignmentData, customTemplateId })
              }}
            />
          )}

          {currentStep === 'cover' && (
            <CoverPageBuilder
              assignmentType={assignmentData.type!}
              templateId={assignmentData.templateId || assignmentData.customTemplateId}
              data={assignmentData.coverPageData}
              onChange={(coverPageData) => {
                setAssignmentData({ ...assignmentData, coverPageData })
              }}
            />
          )}

          {currentStep === 'content' && (
            <ContentEditor
              assignmentType={assignmentData.type!}
              content={assignmentData.content}
              references={assignmentData.references}
              onChange={(content, references) => {
                setAssignmentData({ ...assignmentData, content, references })
              }}
            />
          )}

          {currentStep === 'preview' && (
            <AssignmentPreview
              data={assignmentData}
              assignmentId={generatedId}
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
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/30 disabled:opacity-50"
            whileHover={{ scale: isGenerating ? 1 : 1.05 }}
            whileTap={{ scale: isGenerating ? 1 : 0.95 }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Assignment
              </>
            )}
          </motion.button>
        ) : currentStep === 'preview' ? (
          <button
            onClick={() => router.push(`/assignment/${generatedId}`)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Done
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 'type' && !assignmentData.type) ||
              (currentStep === 'method' && !assignmentData.method) ||
              (currentStep === 'template' && !assignmentData.templateId) ||
              (currentStep === 'upload' && !assignmentData.customTemplateId)
            }
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}

// Method Selector Component
function MethodSelector({ 
  value, 
  onChange 
}: { 
  value: 'template' | 'sample' | null
  onChange: (method: 'template' | 'sample') => void 
}) {
  const methods = [
    {
      id: 'template' as const,
      title: 'Use College Template',
      description: 'Select from pre-built templates for Tanzanian universities',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      features: ['Instant setup', 'Pre-formatted', 'College approved'],
    },
    {
      id: 'sample' as const,
      title: 'Upload Sample Assignment',
      description: 'AI will analyze and learn the format from your previous work',
      icon: Upload,
      color: 'from-purple-500 to-pink-500',
      features: ['Custom format', 'AI learning', 'Flexible'],
    },
  ]

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-3">Choose Your Method</h2>
      <p className="text-slate-400 mb-8">
        Select how you want to create your assignment
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {methods.map((method) => {
          const Icon = method.icon
          const isSelected = value === method.id
          return (
            <motion.button
              key={method.id}
              onClick={() => onChange(method.id)}
              className={`relative bg-gradient-to-br ${method.color} p-8 rounded-2xl text-left transition-all ${
                isSelected ? 'ring-4 ring-indigo-500 ring-offset-4 ring-offset-dashboard-bg' : ''
              }`}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-indigo-500" />
                </div>
              )}
              <Icon className="w-10 h-10 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
              <p className="text-sm text-white/80 mb-4">{method.description}</p>
              <ul className="space-y-2">
                {method.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/90">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

