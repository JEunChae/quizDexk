'use client'
import { useState } from 'react'
import type { Card, Difficulty } from '@/types/database'

interface CardFormProps {
  setId: string
  onSave: (values: Pick<Card, 'front' | 'back' | 'difficulty'>) => Promise<void>
  defaultValues?: Partial<Card>
  onCancel?: () => void
}

export function CardForm({ setId, onSave, defaultValues, onCancel }: CardFormProps) {
  const [front, setFront] = useState(defaultValues?.front ?? '')
  const [back, setBack] = useState(defaultValues?.back ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultValues?.difficulty ?? 'medium')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSave({ front, back, difficulty })
      if (!defaultValues) { setFront(''); setBack(''); setDifficulty('medium') }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border rounded p-4">
      <input value={front} onChange={e => setFront(e.target.value)}
        placeholder="앞면" required className="w-full border rounded px-3 py-2" />
      <input value={back} onChange={e => setBack(e.target.value)}
        placeholder="뒷면" required className="w-full border rounded px-3 py-2" />
      <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}
        className="border rounded px-3 py-2">
        <option value="easy">쉬움</option>
        <option value="medium">보통</option>
        <option value="hard">어려움</option>
      </select>
      <div className="flex gap-2">
        <button
          type="submit" disabled={isLoading}
          className="bg-blue-600 text-white rounded px-3 py-1 disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : '저장'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-500">취소</button>
        )}
      </div>
    </form>
  )
}
