'use client'
import { SetForm } from '@/components/sets/set-form'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { FlashSet } from '@/types/database'

export default function NewSetPage() {
  const router = useRouter()

  async function handleSubmit(values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('sets')
      .insert({ ...values, user_id: user!.id })
      .select()
      .single()
    if (error || !data) return
    router.push(`/sets/${data.id}`)
    router.refresh()
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">새 세트 만들기</h1>
      <SetForm onSubmit={handleSubmit} submitLabel="만들기" />
    </main>
  )
}
