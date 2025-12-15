'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DocumentFormatAnalyzerProps {
  onAnalysisComplete: (analysisId: string) => void
}

interface AnalysisPreview {
  sections: Array<{
    type: string
    title?: string
    word_count_range: [number, number]
  }>
  cover_page: {
    has_cover_page: boolean
    layout: string
  }
  formatting: {
    font: string
    font_size: number
    line_spacing: number
  }
  academic_style: {
    tone: string
    formality_level: string
    citation_style: string
  }
  confidence_score: number
}

export function DocumentFormatAnalyzer({ onAnalysisComplete }: DocumentFormatAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisPreview, setAnalysisPreview] = useState<AnalysisPreview | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  const handleAnalyze = useCallback(async (uploadFile: File) => {
    setUploading(true)
    setAnalyzing(true)
    
    try {
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setFile(null)
        setUploading(false)
        setAnalyzing(false)
        return
      }

      // Step 1: Upload file
      const formData = new FormData()
      formData.append('file', uploadFile)

      const uploadResponse = await fetch('/api/assignment/analyze-document', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
        credentials: 'include',
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.error || 'Failed to analyze document')
      }

      const data = await uploadResponse.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      // Store analysis ID and preview
      setAnalysisId(data.analysis_id)
      setAnalysisPreview(data.preview)
      
      toast.success('Document analyzed successfully!')
      onAnalysisComplete(data.analysis_id)
    } catch (error: any) {
      console.error('Analysis error:', error)
      toast.error(error.message || 'Failed to analyze document')
      setFile(null)
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }, [onAnalysisComplete])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile) {
      // Validate file size (max 10MB)
      if (uploadedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      // Validate file type
      const validTypes = ['.docx', '.doc', '.pdf']
      const fileExtension = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.')).toLowerCase()
      if (!validTypes.includes(fileExtension)) {
        toast.error('Invalid file type. Please upload DOCX, DOC, or PDF')
        return
      }

      setFile(uploadedFile)
      await handleAnalyze(uploadedFile)
    }
  }, [handleAnalyze])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
  })

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Analyze Document Format
        </h2>
        <p className="text-slate-400">
          Upload your assignment document. AI will analyze the complete structure and format, then generate new content matching your layout exactly.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-dashboard-border hover:border-green-500/50 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {isDragActive ? 'Drop your file here' : 'Upload Assignment Document'}
              </h3>
              <p className="text-sm text-slate-400 mb-4">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {(uploading || analyzing) && (
                <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
              )}
              {!uploading && !analyzing && analysisId && (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>

            {/* Analysis Progress */}
            {(uploading || analyzing) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Step 1: Parsing document...</span>
                  {uploading && <Loader2 className="w-4 h-4 animate-spin text-green-400" />}
                  {!uploading && <CheckCircle className="w-4 h-4 text-green-400" />}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Step 2: Analyzing structure...</span>
                  {analyzing && <Loader2 className="w-4 h-4 animate-spin text-green-400" />}
                  {!analyzing && analysisId && <CheckCircle className="w-4 h-4 text-green-400" />}
                </div>
              </div>
            )}

            {/* Analysis Preview */}
            {analysisPreview && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Analysis Preview</h3>
                
                {/* Sections Detected */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Sections Detected</h4>
                  <div className="space-y-2">
                    {analysisPreview.sections.map((section, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-white">{section.title || section.type}</span>
                        <span className="text-slate-400">
                          {section.word_count_range[0]}-{section.word_count_range[1]} words
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formatting */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Formatting</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Font:</span>
                      <span className="text-white ml-2">{analysisPreview.formatting.font}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Size:</span>
                      <span className="text-white ml-2">{analysisPreview.formatting.font_size}pt</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Line Spacing:</span>
                      <span className="text-white ml-2">{analysisPreview.formatting.line_spacing}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Citation Style:</span>
                      <span className="text-white ml-2">{analysisPreview.academic_style.citation_style}</span>
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Analysis Complete</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-slate-400">Confidence:</span>
                    <span className="text-green-400 font-medium ml-2">
                      {(analysisPreview.confidence_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {!uploading && !analyzing && !analysisId && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">Analysis failed. Please try again.</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

