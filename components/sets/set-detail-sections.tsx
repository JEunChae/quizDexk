'use client'
import { useState } from 'react'
import { CardItem } from '@/components/cards/card-item'
import { CardForm } from '@/components/cards/card-form'
import { BulkAddForm } from '@/components/cards/bulk-add-form'
import { useFontSize } from '@/hooks/use-font-size'
import type { Card } from '@/types/database'

type Section = 'cards' | 'add' | 'bulk'

interface Props {
  cards: Card[]
  setId: string
  onUpdate: (id: string, values: Partial<Pick<Card, 'front' | 'back' | 'difficulty'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onDeleteAll: () => Promise<void>
  onAdd: (values: Pick<Card, 'front' | 'back' | 'difficulty'>) => Promise<void>
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

const FONT_CLASS = {
  sm:   'text-[clamp(0.65rem,2vw,0.875rem)]',
  base: 'text-[clamp(0.75rem,2.5vw,1rem)]',
  lg:   'text-[clamp(0.875rem,3vw,1.125rem)]',
  xl:   'text-[clamp(1rem,3.5vw,1.25rem)]',
}

export function SetDetailSections({ cards, setId, onUpdate, onDelete, onDeleteAll, onAdd }: Props) {
  const [open, setOpen] = useState<Section | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const [fontSize, increaseFontSize, decreaseFontSize] = useFontSize()

  const toggle = (section: Section) =>
    setOpen(prev => (prev === section ? null : section))

  async function handleDeleteAll() {
    if (!confirm(`카드 ${cards.length}개를 전부 삭제하시겠습니까?`)) return
    setDeletingAll(true)
    await onDeleteAll()
    setDeletingAll(false)
  }

  return (
    <div className="space-y-3">
      {/* 단어 목록 */}
      <div className="border border-stone-200 rounded overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-stone-100">
          <button onClick={() => toggle('cards')} className="flex-1 flex justify-between items-center text-left">
            <span className="text-stone-700 font-semibold">단어 목록</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-400">{cards.length}개</span>
              <ChevronDown open={open === 'cards'} />
            </div>
          </button>
          <div className="flex items-center gap-1 ml-3">
            <button
              onClick={decreaseFontSize}
              className="text-stone-400 text-xs px-1.5 py-0.5 rounded border border-stone-200 leading-none"
              aria-label="글자 작게"
            >A-</button>
            <button
              onClick={increaseFontSize}
              className="text-stone-400 text-sm px-1.5 py-0.5 rounded border border-stone-200 leading-none"
              aria-label="글자 크게"
            >A+</button>
          </div>
          {cards.length > 0 && (
            <button
              onClick={handleDeleteAll} disabled={deletingAll}
              className="btn-note btn-ghost ml-3 text-sm text-stone-400 disabled:opacity-40"
            >
              {deletingAll ? '삭제 중...' : '전체 삭제'}
            </button>
          )}
        </div>
        {open === 'cards' && (
          <div className="overflow-x-auto">
            <div
              className={`notebook-paper pr-4 py-1 ${FONT_CLASS[fontSize]}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                columnGap: '1rem',
                width: 'max-content',
                minWidth: '100%',
              }}
            >
              {cards.length === 0 ? (
                <p className="text-stone-400 text-center py-6" style={{ gridColumn: 'span 2' }}>아직 카드가 없습니다.</p>
              ) : (
                cards.map(card => (
                  <CardItem key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 카드 추가 */}
      <div className="border border-stone-200 rounded overflow-hidden">
        <button onClick={() => toggle('add')} className="w-full flex justify-between items-center px-4 py-3 text-left">
          <span className="text-stone-700 font-semibold">카드 추가</span>
          <ChevronDown open={open === 'add'} />
        </button>
        {open === 'add' && (
          <div className="px-4 pb-5 pt-3 border-t border-stone-100">
            <CardForm onSave={async (values) => { await onAdd(values); setOpen(null) }} />
          </div>
        )}
      </div>

      {/* 대량 추가 */}
      <div className="border border-stone-200 rounded overflow-hidden">
        <button onClick={() => toggle('bulk')} className="w-full flex justify-between items-center px-4 py-3 text-left">
          <span className="text-stone-700 font-semibold">대량 추가</span>
          <ChevronDown open={open === 'bulk'} />
        </button>
        {open === 'bulk' && (
          <div className="px-4 pb-5 pt-3 border-t border-stone-100">
            <BulkAddForm setId={setId} onSuccess={() => setOpen(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
