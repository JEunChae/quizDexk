import { createClient } from '@/lib/supabase/server'
import type { StudySession, CardResult, StudyMode } from '@/types/database'

export async function createSession(userId: string, setId: string, mode: StudyMode): Promise<StudySession> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, set_id: setId, mode })
    .select().single()
  if (error) throw error
  return data
}

export async function endSession(sessionId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('study_sessions').update({ ended_at: new Date().toISOString() }).eq('id', sessionId)
}

export async function saveCardResult(result: Omit<CardResult, 'id' | 'answered_at'>): Promise<void> {
  const supabase = await createClient()
  await supabase.from('card_results').insert(result)
}

export async function getResultsBySet(userId: string, setId: string): Promise<CardResult[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('card_results')
    .select('*, study_sessions!inner(user_id, set_id)')
    .eq('study_sessions.user_id', userId)
    .eq('study_sessions.set_id', setId)
  return data ?? []
}
