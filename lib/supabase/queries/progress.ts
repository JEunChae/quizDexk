import { createClient } from '@/lib/supabase/server'
import type { StudySession, CardResult } from '@/types/database'

export type SessionWithSet = StudySession & { set_title: string | null }

export async function getUserSessions(userId: string): Promise<SessionWithSet[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*, sets(title)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(s => ({ ...s, set_title: (s.sets as { title: string } | null)?.title ?? null }))
}

export async function getResultsBySession(sessionId: string): Promise<CardResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('card_results').select('*').eq('session_id', sessionId)
  if (error) throw error
  return data ?? []
}
