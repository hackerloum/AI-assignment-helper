'use client'

import { useMemo } from 'react'

interface DiffViewerProps {
  original: string
  modified: string
}

// Simple word-by-word diff implementation
function diffWords(original: string, modified: string) {
  const originalWords = original.split(/(\s+)/)
  const modifiedWords = modified.split(/(\s+)/)
  
  const result: Array<{ value: string; added?: boolean; removed?: boolean }> = []
  let origIndex = 0
  let modIndex = 0

  while (origIndex < originalWords.length || modIndex < modifiedWords.length) {
    if (origIndex >= originalWords.length) {
      // Only modified words left
      result.push({ value: modifiedWords[modIndex], added: true })
      modIndex++
    } else if (modIndex >= modifiedWords.length) {
      // Only original words left
      result.push({ value: originalWords[origIndex], removed: true })
      origIndex++
    } else if (originalWords[origIndex] === modifiedWords[modIndex]) {
      // Words match
      result.push({ value: originalWords[origIndex] })
      origIndex++
      modIndex++
    } else {
      // Check if word appears later in modified
      const foundIndex = modifiedWords.findIndex(
        (word, idx) => idx >= modIndex && word === originalWords[origIndex]
      )
      
      if (foundIndex !== -1) {
        // Word appears later, mark current modified words as added
        for (let i = modIndex; i < foundIndex; i++) {
          result.push({ value: modifiedWords[i], added: true })
        }
        modIndex = foundIndex
      } else {
        // Word doesn't appear, mark as removed
        result.push({ value: originalWords[origIndex], removed: true })
        origIndex++
      }
    }
  }

  return result
}

export function DiffViewer({ original, modified }: DiffViewerProps) {
  const diff = useMemo(() => {
    return diffWords(original, modified)
  }, [original, modified])

  return (
    <div className="space-y-4 h-[400px] overflow-y-auto">
      <div className="prose prose-invert max-w-none">
        {diff.map((part, index) => (
          <span
            key={index}
            className={`${
              part.added
                ? 'bg-emerald-500/20 text-emerald-300 px-1 rounded'
                : part.removed
                ? 'bg-red-500/20 text-red-300 line-through px-1 rounded'
                : 'text-slate-300'
            }`}
          >
            {part.value}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-dashboard-border text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/50 rounded" />
          <span className="text-slate-500">Added</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded" />
          <span className="text-slate-500">Removed</span>
        </div>
      </div>
    </div>
  )
}

