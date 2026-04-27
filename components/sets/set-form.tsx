'use client'
import { useState } from 'react'
import type { FlashSet } from '@/types/database'

interface SetFormProps {
  defaultValues?: Partial<FlashSet>
  onSubmit: (values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>) => Promise<void>
  submitLabel?: string
}

export function SetForm({ defaultValues, onSubmit, submitLabel = '저장' }: SetFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [folder, setFolder] = useState(defaultValues?.folder ?? '')
  const [tagsInput, setTagsInput] = useState(defaultValues?.tags?.join(', ') ?? '')
  const [isPublic, setIsPublic] = useState(defaultValues?.is_public ?? false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      await onSubmit({ title, folder: folder || null, tags, is_public: isPublic })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="세트 이름" required
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
      <input value={folder} onChange={e => setFolder(e.target.value)}
        placeholder="폴더 (선택)"
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
      <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
        placeholder="태그 (쉼표 구분)"
        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
      <label className="flex items-center gap-2 text-slate-700 text-sm cursor-pointer">
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded" />
        공개 세트
      </label>
      <button
        type="submit" disabled={isLoading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors disabled:opacity-50"
      >
        {isLoading ? '저장 중...' : submitLabel}
      </button>
    </form>
  )
}
