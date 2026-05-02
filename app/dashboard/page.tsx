import { getUserSets, updateSet, deleteSet } from '@/lib/supabase/queries/sets'
import { SetCard } from '@/components/sets/set-card'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import type { FlashSet } from '@/types/database'

export default async function DashboardPage() {
  const sets = await getUserSets()

  async function handleUpdateSet(id: string, values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>) {
    'use server'
    await updateSet(id, values)
    revalidatePath('/dashboard')
  }

  async function handleDeleteSet(id: string) {
    'use server'
    await deleteSet(id)
    revalidatePath('/dashboard')
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-stone-800">내 단어장</h1>
        <Link href="/sets/new" className="btn-note btn-primary">
          + 새 단어장
        </Link>
      </div>
      {sets.length === 0 ? (
        <div className="notebook-paper rounded border border-stone-200 p-12 text-center min-h-40">
          <p className="text-stone-400">아직 단어장이 없어요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {sets.map(set => (
            <SetCard
              key={set.id}
              set={set}
              onUpdate={handleUpdateSet}
              onDelete={handleDeleteSet}
            />
          ))}
        </div>
      )}
    </main>
  )
}
