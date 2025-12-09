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
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  "Explain quantum computing in simple terms",
  "What are the effects of climate change on agriculture?",
  "Summarize the main theories of democracy",
  "Discuss the impact of social media on mental health"
]

export default function ResearchPage() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (promptText?: string) => {
    const queryToSend = promptText || query
    if (!queryToSend.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: queryToSend,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setQuery('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSend }),
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
                  Get comprehensive answers to any research question
                </p>
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleExport}
                className="px-4 py-2 bg-dashboard-elevated hover:bg-dashboard-surface border border-dashboard-border rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>

              <motion.button
                onClick={handleNewChat}
                className="px-4 py-2 bg-dashboard-elevated hover:bg-dashboard-surface border border-dashboard-border rounded-lg text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                New Chat
              </motion.button>
            </div>
          )}
        </div>
      </div>

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
              <p className="text-slate-400 mb-8 max-w-md">
                Ask any academic question and get comprehensive, well-researched answers powered by AI
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
                    } rounded-2xl p-4`}>
                      {message.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
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

          <p className="text-xs text-slate-600 mt-3 text-center">
            AI can make mistakes. Verify important information independently.
          </p>
        </div>
      </div>
    </div>
  )
}

