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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-xl font-medium text-center text-slate-900 min-h-[100px] flex items-center justify-center">
        {card.front}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="정답 입력"
          required
          autoFocus
          disabled={submitting}
          className={`flex-1 border rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
            checked === true ? 'border-emerald-500 bg-emerald-50 focus:ring-emerald-500' :
            checked === false ? 'border-rose-500 bg-rose-50 focus:ring-rose-500' :
            'border-slate-200 focus:ring-indigo-500'
          }`}
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 font-medium transition-colors disabled:opacity-50"
        >
          확인
        </button>
      </form>
      {checked === false && (
        <p className="text-rose-600 text-sm">정답: <span className="font-medium">{card.back}</span></p>
      )}
      {checked === true && (
        <p className="text-emerald-600 text-sm font-medium">정답입니다!</p>
      )}
    </div>
  )
}
