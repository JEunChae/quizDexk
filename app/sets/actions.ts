'use server'
import { createClient } from '@/lib/supabase/server'
import type { FlashSet } from '@/types/database'

type CardRow = { set_id: string; front: string; back: string; difficulty: 'easy' | 'medium' | 'hard' }

export async function bulkInsertCards(rows: CardRow[]): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const setId = rows[0]?.set_id
  if (!setId) return { error: '세트 정보가 없습니다' }

  const { data: set } = await supabase.from('sets').select('id').eq('id', setId).eq('user_id', user.id).single()
  if (!set) return { error: '권한이 없습니다' }

  const { error } = await supabase.from('cards').insert(rows)
  if (error) return { error: error.message }
  return {}
}

export async function createSetAction(
  values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>
): Promise<{ data?: FlashSet; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }
  const { data, error } = await supabase
    .from('sets')
    .insert({ ...values, user_id: user.id })
    .select()
    .single()
  if (error || !data) return { error: error?.message ?? '저장에 실패했습니다' }
  return { data }
}
