'use client'
import { useState } from 'react'
import { CardItem } from '@/components/cards/card-item'
import { CardForm } from '@/components/cards/card-form'
import { BulkAddForm } from '@/components/cards/bulk-add-form'
import type { Card } from '@/types/database'

type Section = 'cards' | 'add' | 'bulk'

interface Props {
  cards: Card[]
  setId: string
  onUpdate: (id: string, values: Partial<Pick<Card, 'front' | 'back' | 'difficulty'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAdd: (values: Pick<Card, 'front' | 'back' | 'difficulty'>) => Promise<void>
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function SetDetailSections({ cards, setId, onUpdate, onDelete, onAdd }: Props) {
  const [open, setOpen] = useState<Section | null>(null)

  const toggle = (section: Section) =>
    setOpen(prev => (prev === section ? null : section))

  return (
    <div className="space-y-3">
      {/* 카드 목록 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => toggle('cards')}
          className="w-full flex justify-between items-center px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <span className="font-semibold text-slate-900">카드 목록</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 font-medium">{cards.length}개</span>
            <ChevronDown open={open === 'cards'} />
          </div>
        </button>
        {open === 'cards' && (
          <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
            {cards.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">아직 카드가 없습니다.</p>
            ) : (
              cards.map(card => (
                <CardItem key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
              ))
            )}
          </div>
        )}
      </div>

      {/* 카드 추가 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => toggle('add')}
          className="w-full flex justify-between items-center px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <span className="font-semibold text-slate-900">카드 추가</span>
          <ChevronDown open={open === 'add'} />
        </button>
        {open === 'add' && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
            <CardForm onSave={onAdd} />
          </div>
        )}
      </div>

      {/* 대량 추가 */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <button
          onClick={() => toggle('bulk')}
          className="w-full flex justify-between items-center px-5 py-4 hover:bg-slate-50 transition-colors"
        >
          <span className="font-semibold text-slate-900">대량 추가</span>
          <ChevronDown open={open === 'bulk'} />
        </button>
        {open === 'bulk' && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-4">
            <BulkAddForm setId={setId} />
          </div>
        )}
      </div>
    </div>
  )
}
