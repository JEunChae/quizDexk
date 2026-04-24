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
        className="w-full border rounded px-3 py-2" />
      <input value={folder} onChange={e => setFolder(e.target.value)}
        placeholder="폴더 (선택)"
        className="w-full border rounded px-3 py-2" />
      <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
        placeholder="태그 (쉼표 구분)"
        className="w-full border rounded px-3 py-2" />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        공개 세트
      </label>
      <button
        type="submit" disabled={isLoading}
        className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {isLoading ? '저장 중...' : submitLabel}
      </button>
    </form>
  )
}
