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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm text-stone-400 mb-1">단어장 이름 *</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="예) 수능 영어 1단원" required maxLength={100} className="input-note" />
      </div>
      <div>
        <label className="block text-sm text-stone-400 mb-1">태그</label>
        <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
          placeholder="예) 영어, 수능, 단어" maxLength={200} className="input-note" />
      </div>
      <label className="flex items-center gap-2 text-stone-600 text-sm cursor-pointer">
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        공개 단어장
      </label>
      <button type="submit" disabled={isLoading} className="btn-note btn-primary disabled:opacity-50">
        {isLoading ? '저장 중...' : submitLabel}
      </button>
    </form>
  )
}
