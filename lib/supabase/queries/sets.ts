import { createClient } from '@/lib/supabase/server'
import type { FlashSet } from '@/types/database'

export async function getUserSets(): Promise<FlashSet[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSetById(id: string): Promise<FlashSet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sets').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function createSet(values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>): Promise<FlashSet> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('sets')
    .insert({ ...values, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSet(id: string, values: Partial<Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('sets').update(values).eq('id', id)
  if (error) throw error
}

export async function deleteSet(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('sets').delete().eq('id', id)
  if (error) throw error
}
