'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, Upload, Info, Sparkles, FileText, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface SubmissionFormProps {
  coverPageData?: {
    title?: string;
    subject?: string;
    academicLevel?: string;
    wordCount?: number;
    formattingStyle?: string;
    [key: string]: any;
  };
  onSuccess?: () => void;
}

export function SubmissionForm({ coverPageData, onSuccess }: SubmissionFormProps) {
  const [submissionType, setSubmissionType] = useState<'individual' | 'group'>('individual');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [submissionMethod, setSubmissionMethod] = useState<'upload' | 'text'>('upload');
  const [formData, setFormData] = useState({
    title: coverPageData?.title || '',
    subject: coverPageData?.subject || '',
    collegeName: '',
    academicLevel: coverPageData?.academicLevel || 'undergraduate',
    wordCount: coverPageData?.wordCount?.toString() || '',
    formattingStyle: coverPageData?.formattingStyle || 'APA',
    assignmentContent: '',
    canUseForTraining: false,
  });

  const wordCount = formData.assignmentContent.trim().split(/\s+/).filter(Boolean).length;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type - only docx and pdf
    const validTypes = ['.docx', '.pdf'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert('Invalid file type. Only DOCX and PDF files are allowed.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/submissions/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (data.success) {
        setFileUrl(data.fileUrl);
        // Auto-fill title if empty
        if (!formData.title) {
          setFormData(prev => ({ 
            ...prev, 
            title: file.name.replace(/\.[^/.]+$/, '') 
          }));
        }
      } else {
        alert(data.error || 'Failed to upload file');
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  }, [formData.title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const removeFile = () => {
    setUploadedFile(null);
    setFileUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate: either file upload OR text content required
    if (submissionMethod === 'upload' && !fileUrl) {
      alert('Please upload a file or switch to text input method');
      return;
    }

    if (submissionMethod === 'text' && (!formData.assignmentContent.trim() || wordCount < 100)) {
      alert('Assignment content must be at least 100 words when using text input');
      return;
    }

    if (!formData.collegeName.trim()) {
      alert('Please enter your college/university name');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionType,
          ...formData,
          collegeName: formData.collegeName.trim(),
          wordCount: parseInt(formData.wordCount) || wordCount || 0,
          assignmentContent: submissionMethod === 'upload' ? '' : formData.assignmentContent.trim(),
          fileUrls: fileUrl ? [fileUrl] : [],
          coverPageData: {
            ...coverPageData,
            ...formData,
            collegeName: formData.collegeName.trim(),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-3xl mx-auto bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-400 mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">Submission Successful!</h3>
          <p className="text-slate-400 mb-4">
            Your assignment has been submitted and is pending review.
          </p>
          <p className="text-sm text-slate-500">
            You will receive credits after approval (typically within 24-48 hours).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Submit Assignment</h2>
        <p className="text-slate-400">
          Submit your completed assignment to earn credits and help improve our AI models
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={submissionType} onValueChange={(v) => setSubmissionType(v as any)}>
            <TabsList className="grid w-full grid-cols-2 bg-dashboard-surface border border-dashboard-border">
              <TabsTrigger 
                value="individual"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                Individual Submission
              </TabsTrigger>
              <TabsTrigger 
                value="group"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                Group Submission
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">Assignment Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assignment title"
                className="bg-dashboard-surface border-dashboard-border text-white placeholder:text-slate-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-slate-300">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Computer Science, History"
                className="bg-dashboard-surface border-dashboard-border text-white placeholder:text-slate-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collegeName" className="text-slate-300">College/University Name *</Label>
            <Input
              id="collegeName"
              value={formData.collegeName}
              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
              placeholder="e.g., University of Dar es Salaam, LGTI"
              className="bg-dashboard-surface border-dashboard-border text-white placeholder:text-slate-500"
              required
            />
            <p className="text-xs text-slate-500">
              This helps us organize assignments by college
            </p>
          </div>

          {/* Submission Method Toggle */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="text-slate-300">Submission Method *</Label>
              <Tabs value={submissionMethod} onValueChange={(v) => setSubmissionMethod(v as any)}>
                <TabsList className="bg-dashboard-surface border border-dashboard-border">
                  <TabsTrigger 
                    value="upload"
                    className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
                  >
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger 
                    value="text"
                    className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
                  >
                    Type/Paste Text
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {submissionMethod === 'upload' ? (
              <div className="space-y-2">
                <Label className="text-slate-300">Upload Assignment File *</Label>
                {!uploadedFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-dashboard-border bg-dashboard-surface hover:border-purple-500/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    {isDragActive ? (
                      <p className="text-purple-400 font-medium">Drop the file here...</p>
                    ) : (
                      <>
                        <p className="text-slate-300 font-medium mb-2">
                          Drag & drop your assignment file here, or click to select
                        </p>
                        <p className="text-sm text-slate-500">
                          Only DOCX and PDF files are accepted (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-dashboard-surface border border-dashboard-border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-400">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {uploading && (
                  <p className="text-sm text-purple-400 flex items-center gap-2">
                    <Upload className="w-4 h-4 animate-spin" />
                    Uploading file...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content" className="text-slate-300">Assignment Content *</Label>
                  <span className="text-sm text-slate-400">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>
                </div>
                <Textarea
                  id="content"
                  value={formData.assignmentContent}
                  onChange={(e) => setFormData({ ...formData, assignmentContent: e.target.value })}
                  rows={20}
                  placeholder="Paste your complete assignment here. Include all sections: introduction, main body, conclusion, and references..."
                  className="font-mono text-sm bg-dashboard-surface border-dashboard-border text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Minimum 100 words required. Make sure your assignment is complete and properly formatted.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicLevel" className="text-slate-300">Academic Level</Label>
              <Select
                value={formData.academicLevel}
                onValueChange={(value) => setFormData({ ...formData, academicLevel: value })}
              >
                <SelectTrigger id="academicLevel" className="bg-dashboard-surface border-dashboard-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dashboard-elevated border-dashboard-border">
                  <SelectItem value="high_school" className="text-white hover:bg-dashboard-surface">High School</SelectItem>
                  <SelectItem value="undergraduate" className="text-white hover:bg-dashboard-surface">Undergraduate</SelectItem>
                  <SelectItem value="graduate" className="text-white hover:bg-dashboard-surface">Graduate</SelectItem>
                  <SelectItem value="phd" className="text-white hover:bg-dashboard-surface">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordCount" className="text-slate-300">Word Count</Label>
              <Input
                id="wordCount"
                type="number"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: e.target.value })}
                placeholder="e.g., 2000"
                min="100"
                className="bg-dashboard-surface border-dashboard-border text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formattingStyle" className="text-slate-300">Formatting Style</Label>
              <Select
                value={formData.formattingStyle}
                onValueChange={(value) => setFormData({ ...formData, formattingStyle: value })}
              >
                <SelectTrigger id="formattingStyle" className="bg-dashboard-surface border-dashboard-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dashboard-elevated border-dashboard-border">
                  <SelectItem value="APA" className="text-white hover:bg-dashboard-surface">APA</SelectItem>
                  <SelectItem value="MLA" className="text-white hover:bg-dashboard-surface">MLA</SelectItem>
                  <SelectItem value="Chicago" className="text-white hover:bg-dashboard-surface">Chicago</SelectItem>
                  <SelectItem value="Harvard" className="text-white hover:bg-dashboard-surface">Harvard</SelectItem>
                  <SelectItem value="IEEE" className="text-white hover:bg-dashboard-surface">IEEE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id="training"
                    checked={formData.canUseForTraining}
                    onChange={(e) => setFormData({ ...formData, canUseForTraining: e.target.checked })}
                    className="rounded border-dashboard-border bg-dashboard-surface"
                  />
                  <Label htmlFor="training" className="font-semibold text-white cursor-pointer">
                    Allow this assignment to be used for AI training
                  </Label>
                </div>
                <p className="text-sm text-slate-400">
                  By checking this box, you agree to let us use your assignment (anonymized) to improve our AI models. 
                  You&apos;ll receive a <span className="font-semibold text-blue-400">10% bonus credits</span> for helping us improve!
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-4 bg-dashboard-surface border border-dashboard-border rounded-lg">
            <Info className="h-5 w-5 text-slate-400" />
            <div className="text-sm text-slate-400">
              <p className="font-medium text-white mb-1">What happens next?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your submission will be reviewed within 24-48 hours</li>
                <li>Credits are awarded based on quality (25-100+ credits)</li>
                <li>You&apos;ll receive a notification when reviewed</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              disabled={loading}
              className="border-dashboard-border text-slate-300 hover:bg-dashboard-surface"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploading || (submissionMethod === 'text' && wordCount < 100) || !formData.collegeName.trim()}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

