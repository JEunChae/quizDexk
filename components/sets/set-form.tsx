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

  const [tagsInput, setTagsInput] = useState(defaultValues?.tags?.join(', ') ?? '')
  const [isPublic, setIsPublic] = useState(defaultValues?.is_public ?? false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      await onSubmit({ title, folder: null, tags, is_public: isPublic })
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
  const labelCls = "block text-xs font-medium text-slate-500 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
      <div>
        <label className={labelCls}>세트 이름 *</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="예) 영어 단어 1단원" required className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>태그</label>
        <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
          placeholder="예) 영어, 단어, 수능" className={inputCls} />
      </div>
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
