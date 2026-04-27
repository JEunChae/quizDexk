'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { CardForm } from './card-form'

const difficultyColor = { easy: 'text-emerald-600', medium: 'text-amber-600', hard: 'text-rose-600' }
const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }

interface CardItemProps {
  card: Card
  onUpdate: (id: string, values: Partial<Pick<Card, 'front' | 'back' | 'difficulty'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function handleDelete() {
    if (!confirm('이 카드를 삭제하시겠습니까?')) return
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await onDelete(card.id)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '삭제에 실패했습니다')
    } finally {
      setIsDeleting(false)
    }
  }

  if (editing) {
    return (
      <CardForm
        defaultValues={card}
        onSave={async (values) => { await onUpdate(card.id, values); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900">{card.front}</p>
        <p className="text-slate-500 mt-1 text-sm">{card.back}</p>
        <span className={`text-xs font-medium ${difficultyColor[card.difficulty]}`}>
          {difficultyLabel[card.difficulty]}
        </span>
      </div>
      <div className="flex gap-2 ml-4 shrink-0 flex-col items-end">
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">수정</button>
          <button
            onClick={handleDelete} disabled={isDeleting}
            className="text-rose-500 hover:text-rose-600 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
        {deleteError && <p className="text-rose-500 text-xs">{deleteError}</p>}
      </div>
    </div>
  )
}
