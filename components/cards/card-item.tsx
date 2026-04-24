'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { CardForm } from './card-form'

const difficultyColor = { easy: 'text-green-600', medium: 'text-yellow-600', hard: 'text-red-600' }
const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }

interface CardItemProps {
  card: Card
  onUpdate: (id: string, values: Partial<Pick<Card, 'front' | 'back' | 'difficulty'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [editing, setEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('이 카드를 삭제하시겠습니까?')) return
    setIsDeleting(true)
    try {
      await onDelete(card.id)
    } finally {
      setIsDeleting(false)
    }
  }

  if (editing) {
    return (
      <CardForm
        setId={card.set_id}
        defaultValues={card}
        onSave={async (values) => { await onUpdate(card.id, values); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="border rounded p-4 flex justify-between items-start">
      <div className="flex-1 min-w-0">
        <p className="font-medium">{card.front}</p>
        <p className="text-gray-600 mt-1">{card.back}</p>
        <span className={`text-xs ${difficultyColor[card.difficulty]}`}>
          {difficultyLabel[card.difficulty]}
        </span>
      </div>
      <div className="flex gap-2 ml-4 shrink-0">
        <button onClick={() => setEditing(true)} className="text-blue-600 text-sm">수정</button>
        <button
          onClick={handleDelete} disabled={isDeleting}
          className="text-red-500 text-sm disabled:opacity-50"
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  )
}
