'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { FlashSet } from '@/types/database'
import { SetForm } from './set-form'

interface Props {
  set: FlashSet
  onUpdate: (id: string, values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SetCard({ set, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`"${set.title}" 단어장을 삭제하시겠습니까?`)) return
    setDeleting(true)
    await onDelete(set.id)
    setDeleting(false)
  }

  if (editing) {
    return (
      <div className="self-start border border-stone-300 rounded p-5">
        <p className="text-sm text-stone-500 mb-4">단어장 수정</p>
        <SetForm
          defaultValues={set}
          onSubmit={async (values) => { await onUpdate(set.id, values); setEditing(false) }}
          submitLabel="수정 완료"
        />
        <button onClick={() => setEditing(false)} className="btn-note btn-ghost mt-3 text-sm">취소</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[7rem] border border-stone-200 rounded" style={{ backgroundColor: '#fafaf5' }}>
      <Link href={`/sets/${set.id}`} className="flex-1 block px-5 pt-4 pb-3">
        <h2 className="font-semibold text-stone-800" style={{ fontSize: '1.375rem' }}>{set.title}</h2>
        {set.folder && (
          <p className="text-sm text-stone-400 mt-0.5">{set.folder}</p>
        )}
        {set.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {set.tags.map(tag => (
              <span key={tag} className="text-xs text-stone-500 border border-stone-300 rounded-sm px-2 py-0.5">{tag}</span>
            ))}
          </div>
        )}
      </Link>
      <div className="flex gap-3 px-5 py-2.5 border-t border-stone-200">
        <button onClick={() => setEditing(true)} className="btn-note btn-ghost text-sm px-0">수정</button>
        <button onClick={handleDelete} disabled={deleting} className="btn-note btn-ghost text-sm text-stone-400 px-0 disabled:opacity-40">
          {deleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  )
}
