'use client'

import { motion } from 'framer-motion'
import { FileCode, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ReferencingPage() {
  const [sourceType, setSourceType] = useState('website')
  const [citations, setCitations] = useState<string[]>([])

  const handleAddCitation = () => {
    const newCitation = 'Smith, J. (2024). Sample Citation. Journal Name, 15(3), 123-145.'
    setCitations([...citations, newCitation])
    toast.success('Citation added!')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <FileCode className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">APA Referencing</h1>
        </div>
        <p className="text-slate-400">
          Generate perfect APA-style citations instantly
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
      >
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Source Type
        </label>
        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="website">Website</option>
          <option value="book">Book</option>
          <option value="journal">Journal Article</option>
          <option value="newspaper">Newspaper</option>
        </select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Author</label>
            <input
              type="text"
              placeholder="Last name, First initial"
              className="w-full px-4 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Year</label>
            <input
              type="text"
              placeholder="2024"
              className="w-full px-4 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-400 mb-2">Title</label>
            <input
              type="text"
              placeholder="Article or page title"
              className="w-full px-4 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <motion.button
          onClick={handleAddCitation}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          Generate Citation
        </motion.button>
      </motion.div>

      {/* Citations List */}
      {citations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dashboard-elevated border border-dashboard-border rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Your Citations</h2>
          <div className="space-y-3">
            {citations.map((citation, index) => (
              <div key={index} className="p-4 bg-dashboard-bg rounded-lg">
                <p className="text-slate-300">{citation}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

