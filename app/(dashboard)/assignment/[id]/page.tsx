'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Edit, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
    } catch (error: any) {
      console.error('Error loading assignment:', error)
      toast.error('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'docx' | 'pdf') => {
    try {
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        return
      }

      const response = await fetch(`/api/assignment/export?assignmentId=${assignmentId}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to export assignment')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assignment-${assignmentId}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Assignment exported successfully!')
    } catch (error: any) {
      toast.error(error.message)
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
          <Link href="/assignment">
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{assignment.title}</h1>
            <p className="text-slate-400">{assignment.course_name || 'No course'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/assignment/${assignmentId}/edit`}>
            <motion.button
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="w-4 h-4" />
              Edit Assignment
            </motion.button>
          </Link>
          <motion.button
            onClick={() => handleExport('docx')}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            Export DOCX
          </motion.button>
        </div>
      </div>

      {/* Assignment Content */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
        {/* Cover Page Info */}
        <div className="mb-8 pb-8 border-b border-dashboard-border">
          <h2 className="text-xl font-bold text-white mb-4">Assignment Details</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {assignment.course_code && (
              <div>
                <span className="text-slate-400">Course Code:</span>
                <span className="text-white ml-2">{assignment.course_code}</span>
              </div>
            )}
            {assignment.instructor_name && (
              <div>
                <span className="text-slate-400">Instructor:</span>
                <span className="text-white ml-2">{assignment.instructor_name}</span>
              </div>
            )}
            {assignment.submission_date && (
              <div>
                <span className="text-slate-400">Submission Date:</span>
                <span className="text-white ml-2">{new Date(assignment.submission_date).toLocaleDateString()}</span>
              </div>
            )}
            {assignment.word_count && (
              <div>
                <span className="text-slate-400">Word Count:</span>
                <span className="text-white ml-2">{assignment.word_count}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-slate-200">
            {assignment.assignment_content || 'No content available'}
          </div>
        </div>

        {/* References */}
        {assignment.assignment_references && assignment.assignment_references.length > 0 && (
          <div className="mt-8 pt-8 border-t border-dashboard-border">
            <h2 className="text-xl font-bold text-white mb-4">References</h2>
            <ol className="list-decimal list-inside space-y-2">
              {assignment.assignment_references.map((ref: any, index: number) => (
                <li key={index} className="text-slate-300">
                  {ref.title}
                  {ref.author && ` - ${ref.author}`}
                  {ref.year && ` (${ref.year})`}
                  {ref.url && ` - ${ref.url}`}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

