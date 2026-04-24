import { createClient } from '@/lib/supabase/server'
import type { StudySession, CardResult } from '@/types/database'

export async function getUserSessions(userId: string): Promise<StudySession[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getResultsBySession(sessionId: string): Promise<CardResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('card_results').select('*').eq('session_id', sessionId)
  if (error) throw error
  return data ?? []
}
