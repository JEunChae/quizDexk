import { getPublicSets } from '@/lib/supabase/queries/sets'
import { ExploreClient } from '@/components/explore/explore-client'

export default async function ExplorePage() {
  const sets = await getPublicSets()

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-stone-800">공개 단어장</h1>
      </div>
      <ExploreClient sets={sets} />
    </main>
  )
}
