import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserSessions } from '@/lib/supabase/queries/progress'
import { HistoryList } from '@/components/progress/history-list'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const sessions = await getUserSessions(user.id)

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">학습 기록</h1>
      <HistoryList sessions={sessions} />
    </main>
  )
}
