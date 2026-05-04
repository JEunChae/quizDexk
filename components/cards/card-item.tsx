'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { CardForm } from './card-form'

const difficultyColor = { easy: 'text-emerald-500', medium: 'text-amber-500', hard: 'text-rose-500' }
const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }

function detectLang(text: string): string | null {
  if (/[가-힣ㄱ-ㅣ]/.test(text)) return null
  if (/[぀-ヿ]/.test(text)) return 'ja-JP'
  if (/[一-鿿]/.test(text)) return 'zh-CN'
  if (/[a-zA-Z]/.test(text)) return 'en-US'
  return null
}

function speak(text: string, lang: string) {
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  window.speechSynthesis.speak(u)
}

function SpeakerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

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
      <div style={{ display: 'contents' }}>
        <div style={{ gridColumn: 'span 2' }} className="py-1 pr-4">
          <CardForm
            defaultValues={card}
            onSave={async (values) => { await onUpdate(card.id, values); setEditing(false) }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    )
  }

  const lang = detectLang(card.front)

  return (
    <div style={{ display: 'contents' }}>
      <div
        role="button"
        onClick={() => setShowActions(v => !v)}
        className="flex items-center gap-2.5 cursor-pointer"
      >
        <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 shrink-0 block mt-[0.35rem]" />
        <span className="font-en font-bold text-stone-700 whitespace-nowrap">{card.front}</span>
        {lang && (
          <button
            onClick={e => { e.stopPropagation(); speak(card.front, lang) }}
            className="text-slate-500 shrink-0"
            aria-label="발음 듣기"
          >
            <SpeakerIcon />
          </button>
        )}
      </div>
      <span
        role="button"
        onClick={() => setShowActions(v => !v)}
        className="font-ko text-stone-500 whitespace-nowrap cursor-pointer"
      >{card.back}</span>

      {showActions && (
        <div style={{ gridColumn: 'span 2' }} className="flex items-center gap-1.5 text-xs py-0.5">
          <span className={difficultyColor[card.difficulty]}>{difficultyLabel[card.difficulty]}</span>
          <span className="text-stone-200">·</span>
          <button onClick={() => { setShowActions(false); setEditing(true) }} className="text-stone-400">수정</button>
          <span className="text-stone-300">|</span>
          <button onClick={handleDelete} disabled={isDeleting} className="text-stone-400 disabled:opacity-50">
            {isDeleting ? '...' : '삭제'}
          </button>
          {deleteError && <span className="text-rose-500">{deleteError}</span>}
        </div>
      )}
    </div>
  )
}
