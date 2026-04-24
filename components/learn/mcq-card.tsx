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
      <p className="text-xl font-medium text-center py-8 bg-white border rounded-xl p-6">{card.front}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={submitting}
            className={`p-4 rounded-lg border text-left transition-colors ${
              selected === null
                ? 'hover:bg-gray-50'
                : opt === card.back
                  ? 'bg-green-100 border-green-500 text-green-800'
                  : opt === selected
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'opacity-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
