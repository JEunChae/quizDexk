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
  const [showActions, setShowActions] = useState(false)
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
    <div className="py-0.5 grid" style={{ gridTemplateColumns: 'auto 1fr' }}>
      {/* 불릿 */}
      <span className="flex items-start pt-[0.25em] pr-2">
        <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 block shrink-0" />
      </span>

      <div className="flex flex-col gap-y-0.5">
        {/* 단어 줄: 탭하면 액션 토글 */}
        <button
          onClick={() => setShowActions(v => !v)}
          className="flex flex-wrap items-baseline gap-y-0.5 text-left w-full"
        >
          <span className="font-en font-bold text-slate-800 shrink-0">{card.front}</span>
          <span className="text-slate-300 shrink-0 text-[0.8em] mx-2">—</span>
          <span className="font-ko text-slate-700" style={{ marginRight: 'auto' }}>{card.back}</span>
        </button>

        {/* 액션: 탭했을 때만 표시 */}
        {showActions && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className={difficultyColor[card.difficulty]}>{difficultyLabel[card.difficulty]}</span>
            <span className="text-stone-200">·</span>
            <button
              onClick={() => { setShowActions(false); setEditing(true) }}
              className="text-stone-400"
            >수정</button>
            <span className="text-stone-300">|</span>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-stone-400 disabled:opacity-50"
            >{isDeleting ? '...' : '삭제'}</button>
            {deleteError && <p className="text-rose-500">{deleteError}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
