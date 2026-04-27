import { getUserSets } from '@/lib/supabase/queries/sets'
import { SetCard } from '@/components/sets/set-card'
import Link from 'next/link'

export default async function DashboardPage() {
  const sets = await getUserSets()
  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">내 단어장</h1>
          <p className="text-slate-500 text-sm mt-1">플래시카드 세트를 관리하세요</p>
        </div>
        <Link
          href="/sets/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors text-sm"
        >
          + 새 세트
        </Link>
      </div>
      {sets.length === 0
        ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">아직 세트가 없습니다. 새 세트를 만들어보세요.</p>
          </div>
        )
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map(set => <SetCard key={set.id} set={set} />)}
          </div>
        )
      }
    </main>
  )
}
