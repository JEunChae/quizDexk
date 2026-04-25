'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { drawCards } from '@/lib/algorithms/card-draw'
import { Flashcard } from '@/components/learn/flashcard'
import { MCQCard } from '@/components/learn/mcq-card'
import { ShortAnswerCard } from '@/components/learn/short-answer-card'
import type { Card, StudyMode } from '@/types/database'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const MODES: { value: StudyMode; label: string; desc: string }[] = [
  { value: 'flip', label: '카드 뒤집기', desc: '카드를 보고 뒤집어 정답 확인' },
  { value: 'mcq', label: '객관식', desc: '4개 보기 중 정답 선택' },
  { value: 'short_answer', label: '주관식', desc: '직접 입력으로 정답 확인' },
]

export default function LearnPage() {
  const { id: setId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [allCards, setAllCards] = useState<Card[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [index, setIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mode, setMode] = useState<StudyMode | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); router.push('/login'); return }

      const [{ data: cardsData }, { data: prevResults }] = await Promise.all([
        supabase.from('cards').select('*').eq('set_id', setId),
        supabase
          .from('card_results')
          .select('*, study_sessions!inner(user_id, set_id)')
          .eq('study_sessions.user_id', user.id)
          .eq('study_sessions.set_id', setId),
      ])

      const all = cardsData ?? []
      const drawn = drawCards(all, prevResults ?? [], { wrongFirst: true })
      setAllCards(all)
      setCards(drawn)
      setLoading(false)
    }
    init()
  }, [setId, supabase])

  async function startSession(selectedMode: StudyMode) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('study_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('set_id', setId)
      .is('ended_at', null)

    const { data: session } = await supabase
      .from('study_sessions')
      .insert({ user_id: user.id, set_id: setId, mode: selectedMode })
      .select().single()

    setSessionId(session?.id ?? null)
    setMode(selectedMode)
    setIndex(0)
    setDone(false)
  }

  const handleResult = useCallback(async (isCorrect: boolean) => {
    if (!sessionId || !cards[index] || submitting) return
    setSubmitting(true)
    try {
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
    } finally {
      setSubmitting(false)
    }
  }, [sessionId, cards, index, submitting, supabase])

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

  if (!mode) return (
    <main className="max-w-lg mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <Link href={`/sets/${setId}`} className="text-sm text-gray-500 hover:text-gray-700">← 세트로</Link>
        <p className="text-sm text-gray-500">카드 {cards.length}개</p>
      </div>
      <h2 className="text-xl font-bold mb-6 text-center">학습 모드 선택</h2>
      <div className="space-y-3">
        {MODES.map(m => (
          <button
            key={m.value}
            onClick={() => startSession(m.value)}
            className="w-full border rounded-xl p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <p className="font-semibold">{m.label}</p>
            <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
          </button>
        ))}
      </div>
    </main>
  )

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold">학습 완료!</h2>
      <p className="text-gray-500">총 {cards.length}개 카드를 학습했습니다.</p>
      <div className="flex gap-3">
        <button
          onClick={() => { setMode(null); setSessionId(null) }}
          className="bg-blue-600 text-white rounded px-4 py-2"
        >
          다시 학습
        </button>
        <Link href={`/sets/${setId}`} className="border rounded px-4 py-2">세트로 돌아가기</Link>
      </div>
    </div>
  )

  const card = cards[index]

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Link href={`/sets/${setId}`} className="text-sm text-gray-500 hover:text-gray-700">← 세트로</Link>
        <p className="text-sm text-gray-500">{index + 1} / {cards.length}</p>
      </div>
      {mode === 'flip' && <Flashcard card={card} onResult={handleResult} />}
      {mode === 'mcq' && <MCQCard card={card} allCards={allCards} onResult={handleResult} />}
      {mode === 'short_answer' && <ShortAnswerCard card={card} onResult={handleResult} />}
    </main>
  )
}
