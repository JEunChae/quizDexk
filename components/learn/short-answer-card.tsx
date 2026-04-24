'use client'
import { useState, useRef } from 'react'
import type { Card } from '@/types/database'
import { gradeShortAnswer } from '@/lib/algorithms/grading'

export function ShortAnswerCard({ card, onResult }: {
  card: Card
  onResult: (isCorrect: boolean) => void
}) {
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    const isCorrect = gradeShortAnswer(answer, card.back)
    setChecked(isCorrect)
    setSubmitting(true)
    setTimeout(() => {
      setAnswer('')
      setChecked(null)
      setSubmitting(false)
      onResult(isCorrect)
      inputRef.current?.focus()
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <p className="text-xl font-medium text-center py-8 bg-white border rounded-xl p-6">{card.front}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="정답 입력"
          required
          autoFocus
          disabled={submitting}
          className={`flex-1 border rounded px-3 py-2 ${
            checked === true ? 'border-green-500 bg-green-50' :
            checked === false ? 'border-red-500 bg-red-50' : ''
          }`}
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
        >
          확인
        </button>
      </form>
      {checked === false && (
        <p className="text-red-600 text-sm">정답: <span className="font-medium">{card.back}</span></p>
      )}
      {checked === true && (
        <p className="text-green-600 text-sm font-medium">정답입니다!</p>
      )}
    </div>
  )
}
