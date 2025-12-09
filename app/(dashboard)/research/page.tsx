'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Sparkles, 
  Send, 
  Loader2, 
  Copy, 
  Download,
  BookOpen,
  Lightbulb,
  RefreshCw,
  Settings,
  X,
  GraduationCap,
  Layers,
  Palette,
  BookMarked
} from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import type { ResearchOptions } from '@/lib/ai-service'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  options?: ResearchOptions
}

const suggestedPrompts = [
  "Explain photosynthesis step by step for biology class",
  "What is the difference between correlation and causation?",
  "How does the water cycle work? Include examples",
  "Explain the causes and effects of World War I",
  "What are the main principles of democracy?",
  "How do supply and demand affect prices in economics?"
]

export default function ResearchPage() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [researchOptions, setResearchOptions] = useState<ResearchOptions>({
    depth: 'intermediate',
    format: 'comprehensive',
    includeExamples: true,
    includeVisualSuggestions: true,
    studentLevel: 'undergraduate'
  })

  const handleSubmit = async (promptText?: string) => {
    const queryToSend = promptText || query
    if (!queryToSend.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: queryToSend,
      timestamp: new Date(),
      options: { ...researchOptions }
    }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setIsLoading(true)

    try {
      // Get session token for authentication
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        toast.error('Session expired. Please refresh the page.')
        setIsLoading(false)
        setMessages(prev => prev.slice(0, -1))
        return
      }

      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        body: JSON.stringify({ 
          query: queryToSend,
          options: researchOptions
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate answer')
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer || 'I apologize, but I could not generate a response. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

      toast.success('Research completed!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate research')
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const handleExport = () => {
    const content = messages
      .map(m => `${m.role === 'user' ? 'Q: ' : 'A: '}${m.content}`)
      .join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `research-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Exported successfully!')
  }

  const handleNewChat = () => {
    setMessages([])
    setQuery('')
    toast.success('Started new research session')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Breadcrumb />
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Research Assistant</h1>
                <p className="text-slate-400 mt-1">
                  Get comprehensive, student-friendly answers to any research question
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setShowConfig(true)}
              className="px-4 py-2 bg-dashboard-elevated hover:bg-dashboard-surface border border-dashboard-border rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="Configure research settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </motion.button>

            {messages.length > 0 && (
              <>
                <motion.button
                  onClick={handleExport}
                  className="px-4 py-2 bg-dashboard-elevated hover:bg-dashboard-surface border border-dashboard-border rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </motion.button>

                <motion.button
                  onClick={handleNewChat}
                  className="px-4 py-2 bg-dashboard-elevated hover:bg-dashboard-surface border border-dashboard-border rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfig(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-dashboard-elevated border border-dashboard-border rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-dashboard-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Settings className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Research Settings</h2>
                      <p className="text-sm text-slate-400">Customize how your research is generated</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfig(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Student Level */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                      <GraduationCap className="w-4 h-4 text-blue-400" />
                      Student Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['high-school', 'undergraduate', 'graduate'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setResearchOptions(prev => ({ ...prev, studentLevel: level }))}
                          className={`p-3 rounded-xl border transition-all text-sm ${
                            researchOptions.studentLevel === level
                              ? 'bg-blue-500/20 border-blue-500 text-white'
                              : 'bg-dashboard-bg border-dashboard-border text-slate-300 hover:border-blue-500/50'
                          }`}
                        >
                          {level === 'high-school' ? 'High School' : level === 'undergraduate' ? 'Undergraduate' : 'Graduate'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Research Depth */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                      <Layers className="w-4 h-4 text-blue-400" />
                      Research Depth
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['basic', 'intermediate', 'advanced'] as const).map((depth) => (
                        <button
                          key={depth}
                          onClick={() => setResearchOptions(prev => ({ ...prev, depth }))}
                          className={`p-3 rounded-xl border transition-all text-sm capitalize ${
                            researchOptions.depth === depth
                              ? 'bg-blue-500/20 border-blue-500 text-white'
                              : 'bg-dashboard-bg border-dashboard-border text-slate-300 hover:border-blue-500/50'
                          }`}
                        >
                          {depth}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {researchOptions.depth === 'basic' && 'Quick overview with essential points'}
                      {researchOptions.depth === 'intermediate' && 'Thorough explanation with multiple perspectives'}
                      {researchOptions.depth === 'advanced' && 'In-depth analysis with comprehensive coverage'}
                    </p>
                  </div>

                  {/* Output Format */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                      <BookMarked className="w-4 h-4 text-blue-400" />
                      Output Format
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['summary', 'comprehensive', 'detailed'] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => setResearchOptions(prev => ({ ...prev, format }))}
                          className={`p-3 rounded-xl border transition-all text-sm capitalize ${
                            researchOptions.format === format
                              ? 'bg-blue-500/20 border-blue-500 text-white'
                              : 'bg-dashboard-bg border-dashboard-border text-slate-300 hover:border-blue-500/50'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Options */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white">Additional Features</label>
                    
                    <label className="flex items-center justify-between p-4 bg-dashboard-bg border border-dashboard-border rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        <div>
                          <div className="text-sm font-medium text-white">Include Examples</div>
                          <div className="text-xs text-slate-400">Add real-world examples and case studies</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={researchOptions.includeExamples}
                        onChange={(e) => setResearchOptions(prev => ({ ...prev, includeExamples: e.target.checked }))}
                        className="w-5 h-5 rounded border-dashboard-border bg-dashboard-bg text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-dashboard-bg border border-dashboard-border rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-sm font-medium text-white">Visual Suggestions</div>
                          <div className="text-xs text-slate-400">Suggest diagrams and visual aids</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={researchOptions.includeVisualSuggestions}
                        onChange={(e) => setResearchOptions(prev => ({ ...prev, includeVisualSuggestions: e.target.checked }))}
                        className="w-5 h-5 rounded border-dashboard-border bg-dashboard-bg text-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t border-dashboard-border bg-dashboard-bg/50">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowConfig(false)}
                      className="px-4 py-2 bg-dashboard-elevated hover:bg-dashboard-surface border border-dashboard-border rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowConfig(false)
                        toast.success('Settings saved!')
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg transition-all"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="bg-dashboard-elevated border border-dashboard-border rounded-2xl overflow-hidden">
        {/* Messages Area */}
        <div className="h-[calc(100vh-28rem)] overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6"
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Start Your Research
              </h2>
              <p className="text-slate-400 mb-2 max-w-md">
                Ask any academic question and get comprehensive, student-friendly answers
              </p>
              <p className="text-xs text-slate-500 mb-8 max-w-md">
                Configure settings to customize depth, format, and learning style
              </p>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setQuery(prompt)
                      handleSubmit(prompt)
                    }}
                    className="p-4 bg-dashboard-bg hover:bg-dashboard-surface border border-dashboard-border rounded-xl text-left transition-all group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                        {prompt}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-white font-semibold text-sm">You</span>
                    ) : (
                      <Sparkles className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`inline-block max-w-full ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' 
                        : 'bg-dashboard-bg border border-dashboard-border text-slate-200'
                    } rounded-2xl p-5`}>
                      {message.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none 
                          prose-headings:text-white prose-headings:font-bold
                          prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-h2:flex prose-h2:items-center prose-h2:gap-2
                          prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-3
                          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
                          prose-strong:text-white prose-strong:font-semibold
                          prose-ul:text-slate-300 prose-ul:my-4
                          prose-li:my-2 prose-li:ml-4
                          prose-code:text-cyan-400 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-400
                          prose-table:text-slate-300 prose-th:border prose-th:border-dashboard-border prose-th:p-2 prose-td:border prose-td:border-dashboard-border prose-td:p-2">
                          <ReactMarkdown
                            components={{
                              h2: ({ children }) => (
                                <h2 className="flex items-center gap-2 text-xl font-bold text-white mt-6 mb-4">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-lg font-semibold text-white mt-4 mb-3">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="text-slate-300 leading-relaxed mb-4">
                                  {children}
                                </p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside text-slate-300 my-4 space-y-2">
                                  {children}
                                </ul>
                              ),
                              li: ({ children }) => (
                                <li className="text-slate-300 my-1">
                                  {children}
                                </li>
                              ),
                              strong: ({ children }) => (
                                <strong className="text-white font-semibold">
                                  {children}
                                </strong>
                              ),
                              code: ({ children }) => (
                                <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Message Actions */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-2 ml-2">
                        <button
                          onClick={() => handleCopy(message.content)}
                          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4 text-slate-500 group-hover:text-white" />
                        </button>
                        <span className="text-xs text-slate-600">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-dashboard-bg border border-dashboard-border rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Researching your question...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-dashboard-border p-4 bg-dashboard-bg/50 backdrop-blur-sm">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="Ask me anything about your research..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-white/5 border border-dashboard-border focus:border-blue-500 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all disabled:opacity-50"
              />
              <div className="absolute right-3 bottom-3 text-xs text-slate-600">
                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">Shift</kbd>
                {' + '}
                <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">Enter</kbd>
                {' for new line'}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="hidden sm:inline">Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-600">
              AI can make mistakes. Verify important information independently.
            </p>
            {researchOptions.depth && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Settings:</span>
                <span className="px-2 py-0.5 bg-white/5 rounded capitalize">{researchOptions.depth}</span>
                <span className="px-2 py-0.5 bg-white/5 rounded capitalize">{researchOptions.studentLevel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
