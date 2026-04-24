'use client'
import { useState } from 'react'
import { SetForm } from '@/components/sets/set-form'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { FlashSet } from '@/types/database'

export default function NewSetPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>) {
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('로그인이 필요합니다'); return }
    const { data, error: insertError } = await supabase
      .from('sets')
      .insert({ ...values, user_id: user.id })
      .select()
      .single()
    if (insertError || !data) { setError(insertError?.message ?? '저장에 실패했습니다'); throw insertError }
    router.push(`/sets/${data.id}`)
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">새 세트 만들기</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <SetForm onSubmit={handleSubmit} submitLabel="만들기" />
    </main>
  )
}
