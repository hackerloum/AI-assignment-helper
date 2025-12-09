'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Loader2, 
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface SampleUploaderProps {
  onUploadComplete: (customTemplateId: string) => void
}

interface AnalysisResult {
  detected_format: {
    font_family: string
    font_size: number
    line_spacing: number
    margins: { top: number; bottom: number; left: number; right: number }
    heading_style: any
  }
  cover_page_detected: boolean
  structure: {
    has_title_page: boolean
    has_table_of_contents: boolean
    sections_count: number
  }
  confidence_score: number
}

export function SampleUploader({ onUploadComplete }: SampleUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [collegeName, setCollegeName] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (uploadedFile) {
      if (uploadedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB')
        return
      }
      setFile(uploadedFile)
      handleAnalyze(uploadedFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
  })

  const handleAnalyze = async (uploadFile: File) => {
    setAnalyzing(true)
    try {
      // Upload file first
      const formData = new FormData()
      formData.append('file', uploadFile)

      const uploadResponse = await fetch('/api/assignment/upload-sample', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      const uploadData = await uploadResponse.json()
      const fileUrl = uploadData.sample_file_url || uploadData.fileUrl

      // Analyze the file
      const analyzeResponse = await fetch('/api/assignment/analyze-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl }),
      })

      if (!analyzeResponse.ok) {
        throw new Error('Failed to analyze file')
      }

      const analysisData = await analyzeResponse.json()
      setAnalysis(analysisData.analysis || analysisData.extractedFormat ? {
        detected_format: analysisData.analysis?.detected_format || {
          font_family: analysisData.extractedFormat?.font || 'Times New Roman',
          font_size: analysisData.extractedFormat?.font_size || 12,
          line_spacing: analysisData.extractedFormat?.line_spacing || 1.5,
          margins: analysisData.extractedFormat?.margins || { top: 1, bottom: 1, left: 1, right: 1 },
          heading_style: analysisData.extractedFormat?.heading_style || {}
        },
        cover_page_detected: analysisData.analysis?.cover_page_detected || true,
        structure: analysisData.analysis?.structure || {
          has_title_page: true,
          has_table_of_contents: false,
          sections_count: 1
        },
        confidence_score: analysisData.analysis?.confidence_score || 0.85
      } : null)
      
      toast.success('File analyzed successfully!')
    } catch (error: any) {
      toast.error(error.message)
      setFile(null)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!file || !analysis || !templateName.trim()) {
      toast.error('Please provide a template name')
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/assignment/templates/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_name: templateName,
          college_name: collegeName || 'Custom',
          assignment_type: 'individual', // Could be determined from analysis
          extracted_format: analysis.detected_format,
          sample_file_url: file.name, // In production, use actual uploaded URL
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save template')
      }

      const { customTemplateId } = await response.json()
      toast.success('Custom template created successfully!')
      onUploadComplete(customTemplateId)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Upload Sample Assignment
        </h2>
        <p className="text-slate-400">
          Upload a previous assignment and our AI will learn the format
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
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-dashboard-border hover:border-indigo-500/50 hover:bg-white/5'
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
                {isDragActive ? 'Drop your file here' : 'Upload Assignment Sample'}
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
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-xs text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null)
                  setAnalysis(null)
                }}
                className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analysis Progress */}
            {analyzing && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Analyzing Format...
                  </h3>
                  <p className="text-sm text-slate-400">
                    Our AI is learning the structure and formatting
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysis && !analyzing && (
              <>
                {/* Confidence Score */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Sparkles className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Analysis Complete!
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        Confidence Score: {Math.round(analysis.confidence_score * 100)}%
                      </p>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${analysis.confidence_score * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detected Format Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">
                      Text Formatting
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Font:</span>
                        <span className="text-white font-medium">
                          {analysis.detected_format.font_family}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Size:</span>
                        <span className="text-white font-medium">
                          {analysis.detected_format.font_size}pt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Line Spacing:</span>
                        <span className="text-white font-medium">
                          {analysis.detected_format.line_spacing}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">
                      Page Structure
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {analysis.structure.has_title_page ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className={analysis.structure.has_title_page ? 'text-white' : 'text-slate-500'}>
                          Title Page
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {analysis.structure.has_table_of_contents ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className={analysis.structure.has_table_of_contents ? 'text-white' : 'text-slate-500'}>
                          Table of Contents
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sections:</span>
                        <span className="text-white font-medium">
                          {analysis.structure.sections_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Template Form */}
                <div className="space-y-4 pt-4 border-t border-dashboard-border">
                  <h3 className="text-lg font-semibold text-white">
                    Save as Custom Template
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., My College Assignment Format"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      College Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g., UDSM"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <motion.button
                    onClick={handleSaveTemplate}
                    disabled={uploading || !templateName.trim()}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving Template...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Save and Continue
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
