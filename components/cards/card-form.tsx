'use client'
import { useState } from 'react'
import type { Card, Difficulty } from '@/types/database'

interface CardFormProps {
  onSave: (values: Pick<Card, 'front' | 'back' | 'difficulty'>) => Promise<void>
  defaultValues?: Partial<Card>
  onCancel?: () => void
}

export function CardForm({ onSave, defaultValues, onCancel }: CardFormProps) {
  const [front, setFront] = useState(defaultValues?.front ?? '')
  const [back, setBack] = useState(defaultValues?.back ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultValues?.difficulty ?? 'medium')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await onSave({ front, back, difficulty })
      if (!defaultValues) { setFront(''); setBack(''); setDifficulty('medium') }
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <p className="text-rose-600 text-sm">{error}</p>
        </div>
      )}
      <input value={front} onChange={e => setFront(e.target.value)}
        placeholder="앞면" required
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
      <input value={back} onChange={e => setBack(e.target.value)}
        placeholder="뒷면" required
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
      <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}
        className="border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
        <option value="easy">쉬움</option>
        <option value="medium">보통</option>
        <option value="hard">어려움</option>
      </select>
      <div className="flex gap-2">
        <button
          type="submit" disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : '저장'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 text-slate-600 transition-colors">취소</button>
        )}
      </div>
    </form>
  )
}
