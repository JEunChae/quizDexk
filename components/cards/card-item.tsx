'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { CardForm } from './card-form'

const difficultyColor = { easy: 'text-emerald-500', medium: 'text-amber-500', hard: 'text-rose-500' }
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
      <div className="py-2 pr-4">
        <CardForm
          defaultValues={card}
          onSave={async (values) => { await onUpdate(card.id, values); setEditing(false) }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 py-1" style={{ minHeight: '2rem' }}>
      {/* 동그라미 불릿 */}
      <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 shrink-0" />

      {/* 영단어 */}
      <span className="font-en font-bold text-base text-slate-800 truncate min-w-0" style={{ flex: '0 1 35%' }}>
        {card.front}
      </span>

      {/* 구분선 */}
      <span className="text-slate-300 shrink-0 text-sm">—</span>

      {/* 한국어 뜻 */}
      <span className="font-ko text-base text-slate-700 truncate min-w-0 flex-1">
        {card.back}
      </span>

      {/* 수정/삭제 */}
      <div className="flex gap-1 shrink-0">
        <button onClick={() => setEditing(true)} className="text-sm text-stone-400 px-1">수정</button>
        <span className="text-stone-300 text-sm">|</span>
        <button
          onClick={handleDelete} disabled={isDeleting}
          className="text-sm text-stone-400 px-1 disabled:opacity-50"
        >
          {isDeleting ? '...' : '삭제'}
        </button>
      </div>
      {deleteError && <p className="text-rose-500 text-xs shrink-0">{deleteError}</p>}
    </div>
  )
}
