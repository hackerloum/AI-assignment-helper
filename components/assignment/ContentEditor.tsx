'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Wand2, 
  Plus, 
  Trash2, 
  FileText,
  BookOpen,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

interface Section {
  id: string
  title: string
  content: string
  order: number
}

interface Reference {
  id: string
  type: 'book' | 'article' | 'website' | 'other'
  authors: string
  year: string
  title: string
  source: string
  url?: string
}

interface ContentEditorProps {
  assignmentType: 'individual' | 'group'
  content: string
  references: Reference[]
  question?: string // The assignment question/task
  fontFamily?: string // Font family (default: 'Times New Roman')
  fontSize?: number // Font size (default: 12)
  documentAnalysisId?: string | null // For document analysis method
  templateId?: string | null // For template method
  onChange: (content: string, references: Reference[], fontFamily?: string, fontSize?: number) => void
}

export function ContentEditor({ 
  assignmentType, 
  content, 
  references,
  question,
  fontFamily: initialFontFamily = 'Times New Roman',
  fontSize: initialFontSize = 12,
  documentAnalysisId,
  templateId,
  onChange 
}: ContentEditorProps) {
  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: 'Introduction', content: '', order: 1 },
    { id: '2', title: 'Body', content: '', order: 2 },
    { id: '3', title: 'Conclusion', content: '', order: 3 },
  ])
  const [activeSection, setActiveSection] = useState<string | null>('1')
  const [generating, setGenerating] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [fontFamily, setFontFamily] = useState(initialFontFamily)
  const [fontSize, setFontSize] = useState(initialFontSize)
  const [wordCount, setWordCount] = useState(500) // Default word count
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [localReferences, setLocalReferences] = useState<Reference[]>(references)

  // Parse existing content into sections on mount
  useEffect(() => {
    if (content && !sections.some(s => s.content)) {
      const parsedSections = parseContentIntoSections(content)
      if (parsedSections.length > 0) {
        setSections(parsedSections)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync references
  useEffect(() => {
    setLocalReferences(references)
  }, [references])

  // Sync sections with parent when they change (for manual edits)
  // This ensures that when user manually edits sections, parent state is updated
  useEffect(() => {
    // Skip if this is the initial load (content already matches)
    if (sections.length > 0) {
      const combined = combineContent()
      // Only update if content actually changed to avoid unnecessary updates
      // Compare with current content prop to see if it's different
      if (combined.trim() !== (content || '').trim()) {
        onChange(combined, localReferences, fontFamily, fontSize)
      }
    }
  }, [sections, localReferences, fontFamily, fontSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateFullAssignment = async () => {
    // Use question if provided, otherwise use aiPrompt
    const finalQuestion = question || aiPrompt.trim()
    
    if (!finalQuestion) {
      toast.error('Please provide the assignment question or describe what you want to generate')
      return
    }

    setGenerating(true)
    try {
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setGenerating(false)
        return
      }

      const response = await fetch('/api/assignment/generate-content', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          // No section - this will trigger full assignment generation
          prompt: finalQuestion,
          assignment_type: assignmentType,
          wordCount: wordCount,
          document_analysis_id: documentAnalysisId || undefined, // Pass document analysis ID if available
          template_id: templateId || undefined, // Pass template ID if available
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate content')
      }

      const data = await response.json()
      
      // Parse the generated content into sections
      const generatedContent = data.content || ''
      const newSections = parseContentIntoSections(generatedContent)
      
      // Update sections state
      setSections(newSections)
      
      // Immediately update parent with new content (using the new sections, not state)
      const newContent = newSections
        .sort((a, b) => a.order - b.order)
        .map(s => `## ${s.title}\n\n${s.content}`)
        .join('\n\n')
      onChange(newContent, localReferences)
      
      toast.success('Full assignment generated successfully!')
      setAiPrompt('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const parseContentIntoSections = (content: string): Section[] => {
    // First, check if content uses section markers: [SECTION:type]content[/SECTION]
    const sectionMarkerRegex = /\[SECTION:(\w+)\]([\s\S]*?)\[\/SECTION\]/g
    const sectionsMap = new Map<string, string>()
    let match
    
    while ((match = sectionMarkerRegex.exec(content)) !== null) {
      const sectionType = match[1].toLowerCase()
      const sectionContent = match[2].trim()
      sectionsMap.set(sectionType, sectionContent)
    }
    
    // If section markers were found, use them to build sections
    if (sectionsMap.size > 0) {
      const parsedSections: Section[] = []
      const sectionOrder = ['introduction', 'body', 'methodology', 'results', 'discussion', 'conclusion']
      let order = 1
      
      // Add sections in order
      for (const type of sectionOrder) {
        if (sectionsMap.has(type)) {
          const title = type.charAt(0).toUpperCase() + type.slice(1)
          parsedSections.push({
            id: order.toString(),
            title: title,
            content: sectionsMap.get(type) || '',
            order: order++
          })
          sectionsMap.delete(type)
        }
      }
      
      // Add any remaining sections (custom sections not in standard order)
      sectionsMap.forEach((content, type) => {
        if (type !== 'references') {
          const title = type.charAt(0).toUpperCase() + type.slice(1)
          parsedSections.push({
            id: order.toString(),
            title: title,
            content: content,
            order: order++
          })
        }
      })
      
      // Ensure we have at least Introduction, Body, Conclusion
      const hasIntroduction = parsedSections.some(s => s.title.toLowerCase() === 'introduction')
      const hasBody = parsedSections.some(s => s.title.toLowerCase() === 'body')
      const hasConclusion = parsedSections.some(s => s.title.toLowerCase() === 'conclusion')
      
      if (!hasIntroduction) {
        parsedSections.unshift({ id: '1', title: 'Introduction', content: '', order: 1 })
        parsedSections.forEach((s, i) => { s.order = i + 1; s.id = (i + 1).toString() })
      }
      if (!hasBody) {
        const conclusionIndex = parsedSections.findIndex(s => s.title.toLowerCase() === 'conclusion')
        const bodyIndex = conclusionIndex >= 0 ? conclusionIndex : parsedSections.length
        parsedSections.splice(bodyIndex, 0, { id: (bodyIndex + 1).toString(), title: 'Body', content: '', order: bodyIndex + 1 })
        parsedSections.forEach((s, i) => { s.order = i + 1; s.id = (i + 1).toString() })
      }
      if (!hasConclusion) {
        parsedSections.push({ id: parsedSections.length.toString(), title: 'Conclusion', content: '', order: parsedSections.length + 1 })
      }
      
      return parsedSections.length > 0 ? parsedSections : [
        { id: '1', title: 'Introduction', content: '', order: 1 },
        { id: '2', title: 'Body', content: '', order: 2 },
        { id: '3', title: 'Conclusion', content: '', order: 3 },
      ]
    }
    
    // Fallback: Try parsing markdown headers (## Section Title)
    const lines = content.split('\n')
    const headerSections: Section[] = []
    let currentSection: Section | null = null
    
    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        if (currentSection) {
          headerSections.push(currentSection)
        }
        currentSection = {
          id: (headerSections.length + 1).toString(),
          title: line.replace('## ', '').trim(),
          content: '',
          order: headerSections.length + 1,
        }
      } else if (currentSection) {
        currentSection.content += (currentSection.content ? '\n' : '') + line
      }
    })
    
    if (currentSection) {
      headerSections.push(currentSection)
    }
    
    if (headerSections.length > 0) {
      return headerSections
    }
    
    // Final fallback: Heuristic parsing by paragraphs
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    
    if (paragraphs.length === 0) {
      // If no paragraphs, put all content in body
      return [
        { id: '1', title: 'Introduction', content: '', order: 1 },
        { id: '2', title: 'Body', content: content, order: 2 },
        { id: '3', title: 'Conclusion', content: '', order: 3 },
      ]
    }

    // Heuristic: First 1-2 paragraphs are introduction, last 1-2 are conclusion, rest is body
    const totalParagraphs = paragraphs.length
    let introEnd = Math.min(2, Math.floor(totalParagraphs * 0.2)) // First 20% or max 2 paragraphs
    let conclusionStart = Math.max(totalParagraphs - 2, Math.floor(totalParagraphs * 0.8)) // Last 20% or max 2 paragraphs
    
    // Ensure we have at least one paragraph for each section
    if (totalParagraphs <= 3) {
      introEnd = 1
      conclusionStart = totalParagraphs
    } else if (totalParagraphs <= 5) {
      introEnd = 1
      conclusionStart = totalParagraphs - 1
    }

    const introParagraphs = paragraphs.slice(0, introEnd)
    const bodyParagraphs = paragraphs.slice(introEnd, conclusionStart)
    const conclusionParagraphs = paragraphs.slice(conclusionStart)

    return [
      { 
        id: '1', 
        title: 'Introduction', 
        content: introParagraphs.join('\n\n'), 
        order: 1 
      },
      { 
        id: '2', 
        title: 'Body', 
        content: bodyParagraphs.join('\n\n'), 
        order: 2 
      },
      { 
        id: '3', 
        title: 'Conclusion', 
        content: conclusionParagraphs.join('\n\n'), 
        order: 3 
      },
    ]
  }

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: 'New Section',
      content: '',
      order: sections.length + 1,
    }
    setSections([...sections, newSection])
    setActiveSection(newSection.id)
  }

  const removeSection = (id: string) => {
    if (sections.length <= 1) {
      toast.error('You must have at least one section')
      return
    }
    setSections(sections.filter(s => s.id !== id))
    if (activeSection === id) {
      setActiveSection(sections.find(s => s.id !== id)?.id || null)
    }
  }

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ))
  }

  const addReference = () => {
    const newRef: Reference = {
      id: Date.now().toString(),
      type: 'article',
      authors: '',
      year: '',
      title: '',
      source: '',
    }
    const updated = [...localReferences, newRef]
    setLocalReferences(updated)
    onChange(combineContent(), updated, fontFamily, fontSize)
  }

  const updateReference = (id: string, updates: Partial<Reference>) => {
    const updated = localReferences.map(r => 
      r.id === id ? { ...r, ...updates } : r
    )
    setLocalReferences(updated)
    onChange(combineContent(), updated, fontFamily, fontSize)
  }

  const removeReference = (id: string) => {
    const updated = localReferences.filter(r => r.id !== id)
    setLocalReferences(updated)
    onChange(combineContent(), updated, fontFamily, fontSize)
  }

  const combineContent = () => {
    // Combine sections without markdown headers - just the content
    return sections
      .sort((a, b) => a.order - b.order)
      .map(s => s.content)
      .filter(c => c.trim().length > 0)
      .join('\n\n')
  }

  // Update parent whenever sections change
  const handleContentUpdate = () => {
    onChange(combineContent(), localReferences, fontFamily, fontSize)
  }

  // Handle font changes
  const handleFontChange = (newFont: string) => {
    setFontFamily(newFont)
    onChange(combineContent(), localReferences, newFont, fontSize)
  }

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize)
    onChange(combineContent(), localReferences, fontFamily, newSize)
  }

  return (
    <div className="space-y-6">
      {/* Formatting Options */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Formatting Options</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300">
              Font Family
            </label>
            <div className="relative">
              <select
                value={fontFamily}
                onChange={(e) => handleFontChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-indigo-500 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '12px',
                }}
              >
                <option value="Times New Roman" className="bg-dashboard-elevated text-white">Times New Roman</option>
                <option value="Arial" className="bg-dashboard-elevated text-white">Arial</option>
                <option value="Calibri" className="bg-dashboard-elevated text-white">Calibri</option>
                <option value="Georgia" className="bg-dashboard-elevated text-white">Georgia</option>
                <option value="Verdana" className="bg-dashboard-elevated text-white">Verdana</option>
                <option value="Cambria" className="bg-dashboard-elevated text-white">Cambria</option>
                <option value="Garamond" className="bg-dashboard-elevated text-white">Garamond</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-300">
              Font Size: <span className="text-indigo-400">{fontSize}pt</span>
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="10"
                max="16"
                step="1"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                style={{
                  background: `linear-gradient(to right, rgb(99, 102, 241) 0%, rgb(99, 102, 241) ${((fontSize - 10) / 6) * 100}%, rgba(255, 255, 255, 0.1) ${((fontSize - 10) / 6) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
                }}
              />
              <div className="flex items-center justify-between gap-2">
                {[10, 11, 12, 14, 16].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                      fontSize === size
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <button
          onClick={() => setShowAiPanel(!showAiPanel)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white">AI Writing Assistant</h3>
              <p className="text-sm text-slate-400">Generate content with AI</p>
            </div>
          </div>
          {showAiPanel ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    What do you want to write about?
                  </label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Explain the importance of database normalization in software engineering..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Word Count: {wordCount.toLocaleString()} words
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="200"
                      max="2000"
                      step="50"
                      value={wordCount}
                      onChange={(e) => setWordCount(Number(e.target.value))}
                      className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex gap-2">
                      {[300, 500, 800, 1200, 1500].map((count) => (
                        <button
                          key={count}
                          onClick={() => setWordCount(count)}
                          className={`px-3 py-1 text-xs rounded-lg transition-all ${
                            wordCount === count
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Estimated cost: {Math.max(5, Math.ceil(wordCount / 100))} credits
                  </p>
                </div>
              </div>
              {question && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                  <p className="text-sm font-semibold text-indigo-400 mb-2">
                    Assignment Question{question.split('\n').filter(q => q.trim().length > 0).length > 1 ? 's' : ''}:
                  </p>
                  <div className="text-sm text-slate-300 whitespace-pre-line space-y-2">
                    {question.split('\n').filter(q => q.trim().length > 0).map((q, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-indigo-400 font-medium min-w-[24px]">
                          {q.match(/^\d+[\.\)]/) ? '' : `${index + 1}.`}
                        </span>
                        <span className="flex-1">{q.trim().replace(/^\d+[\.\)]\s*/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={handleGenerateFullAssignment}
                disabled={generating || (!question && !aiPrompt.trim())}
                className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Full Assignment...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Full Assignment
                  </>
                )}
              </button>
              {!question && (
                <p className="text-xs text-slate-500">
                  💡 Tip: Enter the assignment question or describe what you want to write about. The AI will automatically structure it with introduction, body paragraphs, and conclusion.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sections */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Assignment Sections
          </h3>
          <button
            onClick={addSection}
            className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-sm font-medium rounded-lg transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onActivate={() => setActiveSection(section.id)}
              onUpdate={(updates) => {
                updateSection(section.id, updates)
                handleContentUpdate()
              }}
              onRemove={() => removeSection(section.id)}
              canRemove={sections.length > 1}
            />
          ))}
        </div>
      </div>

      {/* References */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            References (APA Format)
          </h3>
          <button
            onClick={addReference}
            className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-sm font-medium rounded-lg transition-all flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Reference
          </button>
        </div>
        {localReferences.length === 0 ? (
          <div className="text-center py-8 bg-white/5 rounded-lg border border-dashed border-white/10">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No references added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {localReferences.map((ref) => (
              <ReferenceEditor
                key={ref.id}
                reference={ref}
                onUpdate={(updates) => updateReference(ref.id, updates)}
                onRemove={() => removeReference(ref.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Section Editor Component
interface SectionEditorProps {
  section: Section
  isActive: boolean
  onActivate: () => void
  onUpdate: (updates: Partial<Section>) => void
  onRemove: () => void
  canRemove: boolean
}

function SectionEditor({ 
  section, 
  isActive, 
  onActivate, 
  onUpdate, 
  onRemove,
  canRemove 
}: SectionEditorProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(section.content)
    setCopied(true)
    toast.success('Content copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = section.content.split(/\s+/).filter(Boolean).length

  return (
    <motion.div
      layout
      className={`border rounded-xl transition-all ${
        isActive 
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' 
          : 'border-dashboard-border'
      }`}
    >
      <div
        onClick={onActivate}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors rounded-t-xl"
      >
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="text-lg font-semibold text-white bg-transparent border-none outline-none flex-1"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
          {canRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-dashboard-border overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <textarea
                value={section.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Write your content here or use the AI assistant above..."
                rows={10}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Characters: {section.content.length}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Reference Editor Component
interface ReferenceEditorProps {
  reference: Reference
  onUpdate: (updates: Partial<Reference>) => void
  onRemove: () => void
}

function ReferenceEditor({ reference, onUpdate, onRemove }: ReferenceEditorProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="border border-dashboard-border rounded-xl overflow-hidden"
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">
            {reference.title || 'Untitled Reference'}
          </p>
          <p className="text-sm text-slate-400 truncate">
            {reference.authors || 'No author'} ({reference.year || 'No year'})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            reference.type === 'book' ? 'bg-blue-500/10 text-blue-400' :
            reference.type === 'article' ? 'bg-purple-500/10 text-purple-400' :
            reference.type === 'website' ? 'bg-emerald-500/10 text-emerald-400' :
            'bg-slate-500/10 text-slate-400'
          }`}>
            {reference.type}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-1.5 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-dashboard-border p-4 bg-white/5 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={reference.type}
                onChange={(e) => onUpdate({ type: e.target.value as any })}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="book">Book</option>
                <option value="article">Journal Article</option>
                <option value="website">Website</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                value={reference.year}
                onChange={(e) => onUpdate({ year: e.target.value })}
                placeholder="Year"
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={reference.authors}
                onChange={(e) => onUpdate({ authors: e.target.value })}
                placeholder="Author(s)"
                className="col-span-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={reference.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Title"
                className="col-span-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={reference.source}
                onChange={(e) => onUpdate({ source: e.target.value })}
                placeholder="Source (Journal, Publisher, etc.)"
                className="col-span-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
              />
              {reference.type === 'website' && (
                <input
                  type="url"
                  value={reference.url || ''}
                  onChange={(e) => onUpdate({ url: e.target.value })}
                  placeholder="URL"
                  className="col-span-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
