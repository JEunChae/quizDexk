'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'

const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }
const difficultyColor = { easy: 'text-green-600', medium: 'text-yellow-600', hard: 'text-red-600' }

export function Flashcard({ card, onResult }: { card: Card; onResult: (isCorrect: boolean) => void }) {
  const [flipped, setFlipped] = useState(false)

  function handleFlip() {
    setFlipped(f => !f)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onClick={handleFlip}
        className="w-full max-w-lg h-56 bg-white border rounded-xl shadow cursor-pointer flex items-center justify-center p-8 text-center text-xl font-medium select-none hover:shadow-md transition-shadow"
      >
        {flipped ? card.back : card.front}
      </div>
      <p className="text-sm text-gray-400">{flipped ? '뒷면' : '앞면'} — 카드를 클릭해 뒤집기</p>
      {flipped && (
        <div className="flex gap-4">
          <button
            onClick={() => { setFlipped(false); onResult(false) }}
            className="bg-red-100 text-red-700 rounded px-6 py-2 hover:bg-red-200"
          >
            몰랐어요
          </button>
          <button
            onClick={() => { setFlipped(false); onResult(true) }}
            className="bg-green-100 text-green-700 rounded px-6 py-2 hover:bg-green-200"
          >
            알았어요
          </button>
        </div>
      )}
      <span className={`text-xs ${difficultyColor[card.difficulty]}`}>
        {difficultyLabel[card.difficulty]}
      </span>
    </div>
  )
}
