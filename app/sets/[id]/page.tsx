import { getSetById } from '@/lib/supabase/queries/sets'
import { getCardsBySetId, createCard, updateCard, deleteCard, deleteAllCardsBySetId } from '@/lib/supabase/queries/cards'
import { getResultsBySet } from '@/lib/supabase/queries/sessions'
import { createClient } from '@/lib/supabase/server'
import { calculateProgress } from '@/lib/algorithms/progress'
import { ProgressBar } from '@/components/progress/progress-bar'
import { SetDetailSections } from '@/components/sets/set-detail-sections'
import { SessionSizeControl } from '@/components/sets/session-size-control'
import { PriorityInfo } from '@/components/sets/priority-info'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function SetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [set, cards, results] = await Promise.all([
    getSetById(id),
    getCardsBySetId(id),
    user ? getResultsBySet(user.id, id) : Promise.resolve([]),
  ])
  if (!set) notFound()

  const progress = calculateProgress(cards, results)

  async function handleAddCard(values: Pick<import('@/types/database').Card, 'front' | 'back' | 'difficulty'>) {
    'use server'
    await createCard({ ...values, set_id: id })
    revalidatePath(`/sets/${id}`)
  }

  async function handleUpdateCard(cardId: string, values: Partial<Pick<import('@/types/database').Card, 'front' | 'back' | 'difficulty'>>) {
    'use server'
    await updateCard(cardId, values)
    revalidatePath(`/sets/${id}`)
  }

  async function handleDeleteCard(cardId: string) {
    'use server'
    await deleteCard(cardId)
    revalidatePath(`/sets/${id}`)
  }

  async function handleDeleteAllCards() {
    'use server'
    await deleteAllCardsBySetId(id)
    revalidatePath(`/sets/${id}`)
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Link href="/dashboard" className="text-sm text-stone-400 btn-ghost px-0">← 내 단어장</Link>
          <h1 className="text-2xl font-bold text-stone-800 mt-1">{set.title}</h1>
        </div>
        <div className="flex gap-2 mt-1">
          <Link href={`/learn/${set.id}`} className="btn-note btn-primary">학습</Link>
          <Link href={`/test/${set.id}`} className="btn-note btn-secondary">시험</Link>
        </div>
      </div>

      <div className="border border-stone-200 rounded p-4 mb-6">
        <div className="flex justify-between text-sm text-stone-400 mb-2">
          <span className="flex items-center">{cards.length}개 단어 <PriorityInfo /></span>
          <span>진도 {progress}%</span>
        </div>
        <ProgressBar value={progress} />
        <SessionSizeControl totalCards={cards.length} />
      </div>

      <SetDetailSections
        cards={cards}
        setId={id}
        onUpdate={handleUpdateCard}
        onDelete={handleDeleteCard}
        onDeleteAll={handleDeleteAllCards}
        onAdd={handleAddCard}
      />
    </main>
  )
}
