'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AssignmentPreviewProps {
  data: any
  assignmentId: string | null
}

export function AssignmentPreview({ data, assignmentId }: AssignmentPreviewProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!assignmentId) {
      toast.error('Assignment not generated yet')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/assignment/export?assignmentId=${assignmentId}&format=${format}`)
      
      if (!response.ok) {
        throw new Error('Failed to export assignment')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assignment.${format}`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Assignment exported successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Assignment Preview</h2>
          <p className="text-slate-400">Review your assignment before exporting</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => handleExport('docx')}
            disabled={loading}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export DOCX
          </motion.button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="bg-white rounded-xl p-8 shadow-2xl min-h-[600px]">
        {/* Cover Page Preview */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-2xl font-bold mb-8">{data.coverPageData?.title || 'Assignment Title'}</h1>
          <div className="space-y-2 text-left max-w-md mx-auto">
            {data.coverPageData?.college && (
              <p><strong>College:</strong> {data.coverPageData.college}</p>
            )}
            {data.coverPageData?.department && (
              <p><strong>Department:</strong> {data.coverPageData.department}</p>
            )}
            {data.coverPageData?.courseCode && (
              <p><strong>Course Code:</strong> {data.coverPageData.courseCode}</p>
            )}
            {data.coverPageData?.courseName && (
              <p><strong>Course Name:</strong> {data.coverPageData.courseName}</p>
            )}
            {data.type === 'individual' && (
              <>
                {data.coverPageData?.studentName && (
                  <p><strong>Student Name:</strong> {data.coverPageData.studentName}</p>
                )}
                {data.coverPageData?.registrationNumber && (
                  <p><strong>Registration Number:</strong> {data.coverPageData.registrationNumber}</p>
                )}
              </>
            )}
            {data.type === 'group' && (
              <>
                {data.coverPageData?.groupName && (
                  <p><strong>Group Name:</strong> {data.coverPageData.groupName}</p>
                )}
              </>
            )}
            {data.coverPageData?.instructor && (
              <p><strong>Instructor:</strong> {data.coverPageData.instructor}</p>
            )}
            {data.coverPageData?.submissionDate && (
              <p><strong>Submission Date:</strong> {data.coverPageData.submissionDate}</p>
            )}
          </div>
        </div>

        <hr className="my-8" />

        {/* Content Preview */}
        <div className="prose max-w-none">
          {data.content ? (
            <div className="whitespace-pre-wrap text-gray-800">{data.content}</div>
          ) : (
            <p className="text-gray-400 italic">No content generated yet</p>
          )}
        </div>

        {/* References */}
        {data.references && data.references.length > 0 && (
          <>
            <hr className="my-8" />
            <div>
              <h2 className="text-xl font-bold mb-4">References</h2>
              <ol className="list-decimal list-inside space-y-2">
                {data.references.map((ref: any, index: number) => (
                  <li key={index} className="text-gray-700">
                    {ref.title}
                    {ref.author && ` - ${ref.author}`}
                    {ref.year && ` (${ref.year})`}
                    {ref.url && ` - ${ref.url}`}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

