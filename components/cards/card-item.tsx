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
    <div className="py-0.5 grid" style={{ gridTemplateColumns: 'auto 1fr' }}>
      {/* 불릿 (row 1) */}
      <span className="flex items-start pt-[0.25em] pr-2">
        <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 block shrink-0" />
      </span>
      {/* 단어 (row 1) — 한글이 wrap되면 영어 시작 위치에서 시작 */}
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="font-en font-bold text-slate-800 shrink-0">{card.front}</span>
        <span className="text-slate-300 shrink-0 text-[0.8em]">—</span>
        <span className="font-ko text-slate-700">{card.back}</span>
      </div>

      {/* 빈 칸 (row 2, col 1) */}
      <span />
      {/* 버튼 줄 (row 2, col 2) — 자동으로 영어와 같은 x 위치 */}
      <div className="flex items-center gap-2">
        <span className={`text-xs ${difficultyColor[card.difficulty]}`}>
          {difficultyLabel[card.difficulty]}
        </span>
        <span className="text-stone-200 text-xs">·</span>
        <button onClick={() => setEditing(true)} className="text-xs text-stone-400">수정</button>
        <span className="text-stone-300 text-xs">|</span>
        <button onClick={handleDelete} disabled={isDeleting} className="text-xs text-stone-400 disabled:opacity-50">
          {isDeleting ? '...' : '삭제'}
        </button>
        {deleteError && <p className="text-rose-500 text-xs">{deleteError}</p>}
      </div>
    </div>
  )
}
