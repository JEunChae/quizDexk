import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserSessions, type SessionWithSet } from '@/lib/supabase/queries/progress'
import { HistoryList } from '@/components/progress/history-list'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const sessions = await getUserSessions(user.id)

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">학습 기록</h1>
        <p className="text-stone-400 text-sm mt-1">지금까지의 학습 세션</p>
      </div>
      <HistoryList sessions={sessions} />
    </main>
  )
}
