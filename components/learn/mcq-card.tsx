'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { generateMCQOptions } from '@/lib/algorithms/grading'

export function MCQCard({ card, allCards, onResult }: {
  card: Card
  allCards: Card[]
  onResult: (isCorrect: boolean) => void
}) {
  const [options] = useState(() => generateMCQOptions(card, allCards))
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function handleSelect(opt: string) {
    if (selected || submitting) return
    setSelected(opt)
    setSubmitting(true)
    const isCorrect = opt === card.back
    setTimeout(() => {
      setSelected(null)
      setSubmitting(false)
      onResult(isCorrect)
    }, 800)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-xl font-medium text-center text-slate-900 min-h-[100px] flex items-center justify-center">
        {card.front}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={submitting}
            className={`p-4 rounded-xl border text-left transition-all ${
              selected === null
                ? 'bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-900'
                : opt === card.back
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : opt === selected
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'bg-white opacity-50 border-slate-200 text-slate-900'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
