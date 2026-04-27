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
    if (!confirm(`"${set.title}" 단어장을 삭제하시겠습니까?\n카드도 함께 삭제됩니다.`)) return
    setDeleting(true)
    await onDelete(set.id)
    setDeleting(false)
  }

  if (editing) {
    return (
      <div className="bg-white rounded-2xl border border-indigo-200 p-5 shadow-sm">
        <p className="text-sm font-medium text-indigo-600 mb-4">단어장 수정</p>
        <SetForm
          defaultValues={set}
          onSubmit={async (values) => { await onUpdate(set.id, values); setEditing(false) }}
          submitLabel="수정 완료"
        />
        <button onClick={() => setEditing(false)} className="mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors">
          취소
        </button>
      </div>
    )
  }

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all">
      <Link href={`/sets/${set.id}`} className="block p-5 pb-3">
        <h2 className="font-semibold text-slate-700 text-lg">{set.title}</h2>
        {set.folder && <p className="text-sm text-slate-500 mt-0.5">{set.folder}</p>}
        {set.tags.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap">
            {set.tags.map(tag => (
              <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2.5 py-0.5 border border-indigo-100">{tag}</span>
            ))}
          </div>
        )}
      </Link>
      <div className="flex gap-3 px-5 pb-4 border-t border-slate-100 pt-3">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-slate-400 hover:text-indigo-600 font-medium transition-colors"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-slate-400 hover:text-rose-500 font-medium transition-colors disabled:opacity-40"
        >
          {deleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  )
}
