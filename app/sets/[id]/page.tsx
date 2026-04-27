import { getSetById } from '@/lib/supabase/queries/sets'
import { getCardsBySetId, createCard, updateCard, deleteCard } from '@/lib/supabase/queries/cards'
import { getResultsBySet } from '@/lib/supabase/queries/sessions'
import { createClient } from '@/lib/supabase/server'
import { calculateProgress } from '@/lib/algorithms/progress'
import { ProgressBar } from '@/components/progress/progress-bar'
import { CardItem } from '@/components/cards/card-item'
import { CardForm } from '@/components/cards/card-form'
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

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">← 내 단어장</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{set.title}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/learn/${set.id}`} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors">학습</Link>
          <Link href={`/test/${set.id}`} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors">시험</Link>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>{cards.length}개 카드</span>
          <span>학습 진도 {progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
      <div className="space-y-3 mb-8">
        {cards.map(card => (
          <CardItem key={card.id} card={card}
            onUpdate={handleUpdateCard}
            onDelete={handleDeleteCard}
          />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">카드 추가</h2>
        <CardForm onSave={handleAddCard} />
      </div>
    </main>
  )
}
