'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Eye, 
  Edit, 
  Share2,
  Printer,
  FileText,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface AssignmentPreviewProps {
  data: any
  assignmentId: string | null
}

export function AssignmentPreview({ data, assignmentId }: AssignmentPreviewProps) {
  const [downloading, setDownloading] = useState(false)
  const [viewMode, setViewMode] = useState<'preview' | 'formatted'>('preview')

  const handleDownload = async () => {
    if (!assignmentId) {
      toast.error('Assignment not generated yet')
      return
    }

    setDownloading(true)
    try {
      const response = await fetch('/api/assignment/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to export assignment')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `assignment_${assignmentId}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Assignment downloaded successfully!')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              Assignment Generated Successfully! 🎉
            </h2>
            <p className="text-slate-400 mb-4">
              Your {data.type} assignment has been created with proper formatting. 
              You can now download it as a Word document or make final edits.
            </p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={handleDownload}
                disabled={downloading}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                whileHover={{ scale: downloading ? 1 : 1.05 }}
                whileTap={{ scale: downloading ? 1 : 0.95 }}
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download DOCX
                  </>
                )}
              </motion.button>
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
              {assignmentId && (
                <Link href={`/assignment/${assignmentId}`}>
                  <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Edit
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Preview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'preview'
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Quick View
          </button>
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'formatted'
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Formatted View
          </button>
        </div>
      </div>

      {/* Preview Content */}
      {viewMode === 'preview' ? (
        <QuickPreview data={data} />
      ) : (
        <FormattedPreview data={data} />
      )}
    </div>
  )
}

// Quick Preview
function QuickPreview({ data }: { data: any }) {
  const coverPageData = data.coverPageData || {}
  
  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <div className="space-y-6">
        {/* Cover Page Info */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Cover Page Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Assignment Type:</span>
              <p className="text-white font-medium">{data.type}</p>
            </div>
            <div>
              <span className="text-slate-400">Course:</span>
              <p className="text-white font-medium">
                {coverPageData.course_code || coverPageData.module_code} - {coverPageData.course_name || coverPageData.module_name}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">Title:</span>
              <p className="text-white font-medium">{coverPageData.assignment_title || coverPageData.task}</p>
            </div>
            {data.type === 'group' && (
              <>
                <div>
                  <span className="text-slate-400">Group Name/Number:</span>
                  <p className="text-white font-medium">{coverPageData.group_name || coverPageData.group_number}</p>
                </div>
                <div>
                  <span className="text-slate-400">Members:</span>
                  <p className="text-white font-medium">
                    {coverPageData.group_members?.length || 0}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {data.content ? data.content.split(/\s+/).filter(Boolean).length : 0}
            </p>
            <p className="text-sm text-slate-400">Words</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {data.content?.length || 0}
            </p>
            <p className="text-sm text-slate-400">Characters</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white mb-1">
              {data.references?.length || 0}
            </p>
            <p className="text-sm text-slate-400">References</p>
          </div>
        </div>

        {/* Content Preview */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Content Preview</h4>
          <div className="bg-white/5 rounded-xl p-6 max-h-96 overflow-y-auto">
            <pre className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
              {data.content ? data.content.substring(0, 500) + '...' : 'No content yet'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

// Formatted Preview (looks like Word document)
function FormattedPreview({ data }: { data: any }) {
  const coverPageData = data.coverPageData || {}
  
  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none">
      {/* Document Paper */}
      <div className="aspect-[8.5/11] p-16 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Cover Page */}
        <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
          <div>
            <h1 className="text-lg font-bold mb-2">
              {coverPageData.college_school?.toUpperCase() || 'COLLEGE NAME'}
            </h1>
            <p className="text-base">{coverPageData.department}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">COURSE CODE:</span> {coverPageData.course_code || coverPageData.module_code}
            </p>
            <p className="text-sm">
              <span className="font-semibold">COURSE NAME:</span> {coverPageData.course_name || coverPageData.module_name}
            </p>
          </div>
          <h2 className="text-xl font-bold underline">
            {coverPageData.assignment_title || coverPageData.task}
          </h2>
          {data.type === 'group' ? (
            <div>
              <p className="text-lg font-bold mb-4">
                GROUP {coverPageData.group_number ? 'NUMBER' : 'NAME'}: {coverPageData.group_name || coverPageData.group_number}
              </p>
              
              {coverPageData.group_representatives?.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold mb-2">GROUP REPRESENTATIVES:</p>
                  <table className="mx-auto border-collapse border border-black text-sm">
                    <thead>
                      <tr>
                        <th className="border border-black px-4 py-2">NAME</th>
                        <th className="border border-black px-4 py-2">ROLE</th>
                        <th className="border border-black px-4 py-2">REG. NUMBER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coverPageData.group_representatives.map((rep: any, i: number) => (
                        <tr key={i}>
                          <td className="border border-black px-4 py-2">{rep.name}</td>
                          <td className="border border-black px-4 py-2">{rep.role}</td>
                          <td className="border border-black px-4 py-2">{rep.registration_no}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-left space-y-2">
              <p className="text-base">
                <span className="font-semibold">NAME:</span> {coverPageData.student_name}
              </p>
              <p className="text-base">
                <span className="font-semibold">REGISTRATION NUMBER:</span> {coverPageData.registration_number}
              </p>
            </div>
          )}
          <div className="text-left space-y-2">
            <p className="text-base">
              <span className="font-semibold">INSTRUCTOR:</span> {coverPageData.instructor_name}
            </p>
            <p className="text-base">
              <span className="font-semibold">SUBMISSION DATE:</span> {coverPageData.submission_date}
            </p>
          </div>
        </div>
      </div>

      {/* Content Pages Preview */}
      <div className="border-t-4 border-dashed border-gray-300 p-16 text-black" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap leading-loose text-justify" style={{ fontSize: '12pt', lineHeight: '1.5' }}>
            {data.content || 'No content available'}
          </div>

          {/* References */}
          {data.references && data.references.length > 0 && (
            <div className="mt-12">
              <h3 className="text-center font-bold text-base mb-6">REFERENCES</h3>
              <div className="space-y-2 text-sm">
                {data.references.map((ref: any, index: number) => (
                  <p key={index} className="pl-8 -indent-8">
                    {ref.authors || ref.author}. ({ref.year || 'n.d.'}). <i>{ref.title}</i>. {ref.source || ''}.
                    {ref.url && ` Retrieved from ${ref.url}`}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
