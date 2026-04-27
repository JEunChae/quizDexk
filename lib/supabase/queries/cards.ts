import { createClient } from '@/lib/supabase/server'
import type { Card } from '@/types/database'

export async function getCardsBySetId(setId: string): Promise<Card[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cards').select('*').eq('set_id', setId).order('created_at')
  if (error) throw error
  return data
}

export async function createCard(values: Pick<Card, 'set_id' | 'front' | 'back' | 'difficulty'>): Promise<Card> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('cards').insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateCard(id: string, values: Partial<Pick<Card, 'front' | 'back' | 'difficulty'>>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('cards').update(values).eq('id', id)
  if (error) throw error
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}

export async function deleteAllCardsBySetId(setId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('cards').delete().eq('set_id', setId)
  if (error) throw error
}
