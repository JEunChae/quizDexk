import { getSetById } from '@/lib/supabase/queries/sets'
import { getCardsBySetId, createCard, updateCard, deleteCard } from '@/lib/supabase/queries/cards'
import { CardItem } from '@/components/cards/card-item'
import { CardForm } from '@/components/cards/card-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function SetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [set, cards] = await Promise.all([getSetById(id), getCardsBySetId(id)])
  if (!set) notFound()

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
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← 내 단어장</Link>
          <h1 className="text-2xl font-bold mt-1">{set.title}</h1>
        </div>
        <div className="flex gap-3">
          <Link href={`/learn/${set.id}`} className="bg-green-600 text-white rounded px-3 py-1 text-sm">학습</Link>
          <Link href={`/test/${set.id}`} className="bg-orange-600 text-white rounded px-3 py-1 text-sm">시험</Link>
        </div>
      </div>
      <p className="text-gray-500 mb-4">{cards.length}개 카드</p>
      <div className="space-y-3 mb-8">
        {cards.map(card => (
          <CardItem key={card.id} card={card}
            onUpdate={handleUpdateCard}
            onDelete={handleDeleteCard}
          />
        ))}
      </div>
      <h2 className="font-semibold mb-2">카드 추가</h2>
      <CardForm onSave={handleAddCard} />
    </main>
  )
}
