'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'

const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }
const difficultyColor = { easy: 'text-emerald-600', medium: 'text-amber-600', hard: 'text-rose-600' }

export function Flashcard({ card, onResult }: { card: Card; onResult: (isCorrect: boolean) => void }) {
  const [flipped, setFlipped] = useState(false)

  function handleFlip() {
    setFlipped(f => !f)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onClick={handleFlip}
        className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-stone-200 p-8 min-h-[200px] cursor-pointer flex items-center justify-center text-center text-xl font-medium text-stone-700 select-none hover:shadow-lg transition-all"
      >
        {flipped ? card.back : card.front}
      </div>
      <p className="text-sm text-stone-400">{flipped ? '뒷면' : '앞면'} — 카드를 클릭해 뒤집기</p>
      {flipped && (
        <div className="flex gap-4">
          <button
            onClick={() => { setFlipped(false); onResult(false) }}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-6 py-2.5 font-medium transition-colors"
          >
            몰랐어요
          </button>
          <button
            onClick={() => { setFlipped(false); onResult(true) }}
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-2.5 font-medium transition-colors"
          >
            알았어요
          </button>
        </div>
      )}
      <span className={`text-xs font-medium ${difficultyColor[card.difficulty]}`}>
        {difficultyLabel[card.difficulty]}
      </span>
    </div>
  )
}
