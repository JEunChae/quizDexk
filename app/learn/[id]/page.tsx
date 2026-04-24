'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { drawCards } from '@/lib/algorithms/card-draw'
import { Flashcard } from '@/components/learn/flashcard'
import type { Card } from '@/types/database'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LearnPage() {
  const { id: setId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [cards, setCards] = useState<Card[]>([])
  const [index, setIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: cardsData }, { data: prevResults }] = await Promise.all([
        supabase.from('cards').select('*').eq('set_id', setId),
        supabase
          .from('card_results')
          .select('*, study_sessions!inner(user_id, set_id)')
          .eq('study_sessions.user_id', user.id)
          .eq('study_sessions.set_id', setId),
      ])

      const { data: session } = await supabase
        .from('study_sessions')
        .insert({ user_id: user.id, set_id: setId, mode: 'flip' })
        .select().single()

      const drawn = drawCards(cardsData ?? [], prevResults ?? [], { wrongFirst: true })
      setCards(drawn)
      setSessionId(session?.id ?? null)
      setLoading(false)
    }
    init()
  }, [setId])

  const handleResult = useCallback(async (isCorrect: boolean) => {
    if (!sessionId || !cards[index]) return
    await supabase.from('card_results').insert({
      card_id: cards[index].id,
      session_id: sessionId,
      is_correct: isCorrect,
    })
    if (index + 1 >= cards.length) {
      await supabase.from('study_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId)
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }, [sessionId, cards, index])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">로딩 중...</p>
    </div>
  )

  if (cards.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p className="text-gray-500">카드가 없습니다.</p>
      <Link href={`/sets/${setId}`} className="text-blue-600">세트로 돌아가기</Link>
    </div>
  )

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold">학습 완료!</h2>
      <p className="text-gray-500">총 {cards.length}개 카드를 학습했습니다.</p>
      <div className="flex gap-3">
        <button
          onClick={() => { setIndex(0); setDone(false) }}
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          다시 학습
        </button>
        <Link href={`/sets/${setId}`} className="border rounded px-4 py-2">세트로 돌아가기</Link>
      </div>
    </div>
  )

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Link href={`/sets/${setId}`} className="text-sm text-gray-500 hover:text-gray-700">← 세트로</Link>
        <p className="text-sm text-gray-500">{index + 1} / {cards.length}</p>
      </div>
      <Flashcard card={cards[index]} onResult={handleResult} />
    </main>
  )
}
