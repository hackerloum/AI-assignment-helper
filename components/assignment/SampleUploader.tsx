'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface SampleUploaderProps {
  onUploadComplete: (customTemplateId: string) => void
}

export function SampleUploader({ onUploadComplete }: SampleUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc') && !file.name.endsWith('.pdf')) {
      toast.error('Please upload a DOCX, DOC, or PDF file')
      return
    }

    setUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/assignment/upload-sample', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload file')
      }

      const data = await response.json()
      setUploaded(true)
      toast.success('File uploaded and analyzed successfully!')
      
      // Wait a bit before calling onUploadComplete
      setTimeout(() => {
        onUploadComplete(data.customTemplateId)
      }, 1000)
    } catch (error: any) {
      toast.error(error.message)
      setUploading(false)
      setFileName(null)
    }
  }

  return (
    <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-3">Upload Sample Assignment</h2>
      <p className="text-slate-400 mb-8">
        Upload a previous assignment and AI will learn the format
      </p>

      <div className="max-w-2xl mx-auto">
        <label
          htmlFor="file-upload"
          className={`relative block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            uploading || uploaded
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-dashboard-border hover:border-indigo-500/50 hover:bg-white/5'
          }`}
        >
          <input
            id="file-upload"
            type="file"
            accept=".docx,.doc,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading || uploaded}
          />

          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto" />
              <div>
                <p className="text-white font-medium mb-2">Uploading and analyzing...</p>
                <p className="text-sm text-slate-400">{fileName}</p>
              </div>
            </div>
          ) : uploaded ? (
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-medium mb-2">Upload complete!</p>
                <p className="text-sm text-slate-400">Template extracted from {fileName}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-400">
                  DOCX, DOC, or PDF (max 10MB)
                </p>
              </div>
            </div>
          )}
        </label>

        <div className="mt-6 p-4 bg-white/5 rounded-xl">
          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            What AI will extract:
          </h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• Cover page format and layout</li>
            <li>• Font styles and sizes</li>
            <li>• Margins and spacing</li>
            <li>• Citation format</li>
            <li>• Overall structure</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

