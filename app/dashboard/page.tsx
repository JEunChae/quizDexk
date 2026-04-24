import { getUserSets } from '@/lib/supabase/queries/sets'
import { SetCard } from '@/components/sets/set-card'
import Link from 'next/link'

export default async function DashboardPage() {
  const sets = await getUserSets()
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 단어장</h1>
        <Link href="/sets/new" className="bg-blue-600 text-white rounded px-4 py-2">새 세트</Link>
      </div>
      {sets.length === 0
        ? <p className="text-gray-500">아직 세트가 없습니다. 새 세트를 만들어보세요.</p>
        : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sets.map(set => <SetCard key={set.id} set={set} />)}
          </div>
      }
    </main>
  )
}
