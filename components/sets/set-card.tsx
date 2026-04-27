'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { FlashSet } from '@/types/database'

interface Props {
  set: FlashSet
  onUpdate: (id: string, values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SetCard({ set, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState(set.title)
  const [folder, setFolder] = useState(set.folder ?? '')
  const [tagsInput, setTagsInput] = useState(set.tags.join(', '))

  async function handleDelete() {
    if (!confirm(`"${set.title}" 단어장을 삭제하시겠습니까?\n카드도 함께 삭제됩니다.`)) return
    setDeleting(true)
    await onDelete(set.id)
    setDeleting(false)
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    await onUpdate(set.id, { title: title.trim(), folder: folder.trim() || null, tags, is_public: set.is_public })
    setSaving(false)
    setEditing(false)
  }

  function handleCancel() {
    setTitle(set.title)
    setFolder(set.folder ?? '')
    setTagsInput(set.tags.join(', '))
    setEditing(false)
  }

  const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all">
      {editing ? (
        <div className="flex-1 p-5 pb-3 space-y-2">
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="세트 이름" className={inputCls} autoFocus
          />
          <input
            value={folder} onChange={e => setFolder(e.target.value)}
            placeholder="폴더 (선택)" className={inputCls}
          />
          <input
            value={tagsInput} onChange={e => setTagsInput(e.target.value)}
            placeholder="태그 (쉼표 구분)" className={inputCls}
          />
        </div>
      ) : (
        <Link href={`/sets/${set.id}`} className="flex-1 block p-5 pb-3">
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
      )}

      <div className="flex gap-3 px-5 py-3 border-t border-slate-100">
        {editing ? (
          <>
            <button
              onClick={handleSave} disabled={saving || !title.trim()}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors disabled:opacity-40"
            >
              {saving ? '저장 중...' : '완료'}
            </button>
            <button onClick={handleCancel} className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
              취소
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-slate-400 hover:text-indigo-600 font-medium transition-colors"
            >
              수정
            </button>
            <button
              onClick={handleDelete} disabled={deleting}
              className="text-xs text-slate-400 hover:text-rose-500 font-medium transition-colors disabled:opacity-40"
            >
              {deleting ? '삭제 중...' : '삭제'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
