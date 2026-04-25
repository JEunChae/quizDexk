'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { drawCards } from '@/lib/algorithms/card-draw'
import { createExamSession, startExam, answerCard, tickTimer } from '@/lib/algorithms/exam-state'
import { generateMCQOptions } from '@/lib/algorithms/grading'
import { ExamTimer } from '@/components/test/exam-timer'
import { ResultReport } from '@/components/test/result-report'
import type { Card } from '@/types/database'
import type { ExamSession } from '@/lib/algorithms/exam-state'
import { useParams, useRouter } from 'next/navigation'

const TIME_LIMIT = 300

export default function TestPage() {
  const { id: setId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [cards, setCards] = useState<Card[]>([])
  const [session, setSession] = useState<ExamSession | null>(null)
  const [dbSessionId, setDbSessionId] = useState<string | null>(null)
  const [mcqOptions, setMcqOptions] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const endedRef = useRef(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: cardsData } = await supabase.from('cards').select('*').eq('set_id', setId)
      const drawn = drawCards(cardsData ?? [], [], { shuffle: true })
      if (drawn.length === 0) { router.push(`/sets/${setId}`); return }
      const { data: sess } = await supabase.from('study_sessions')
        .insert({ user_id: user.id, set_id: setId, mode: 'exam' }).select().single()
      setCards(drawn)
      setDbSessionId(sess?.id ?? null)
      const examSess = startExam(createExamSession(drawn, TIME_LIMIT))
      setSession(examSess)
      if (drawn[0]) setMcqOptions(generateMCQOptions(drawn[0], drawn))
    }
    init()
  }, [setId, supabase])

  const handleTick = useCallback(() => {
    setSession(s => s ? tickTimer(s) : s)
  }, [])

  useEffect(() => {
    if (!session || session.state !== 'completed' || !dbSessionId || endedRef.current) return
    endedRef.current = true

    const answeredIds = new Set(session.results.map(r => r.card_id))
    const unanswered = session.cards.filter(c => !answeredIds.has(c.id))

    async function finalize() {
      await supabase.from('study_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', dbSessionId!)
      if (unanswered.length > 0) {
        await supabase.from('card_results').insert(
          unanswered.map(c => ({ card_id: c.id, session_id: dbSessionId!, is_correct: false }))
        )
      }
    }
    finalize()
  }, [session, dbSessionId, supabase])

  async function handleAnswer(isCorrect: boolean) {
    if (!session || !dbSessionId || submitting || session.state === 'completed') return
    setSubmitting(true)
    try {
      const card = session.cards[session.currentIndex]
      await supabase.from('card_results').insert({ card_id: card.id, session_id: dbSessionId, is_correct: isCorrect })
      const next = answerCard(session, card.id, isCorrect)
      if (next.state !== 'completed') {
        setMcqOptions(generateMCQOptions(next.cards[next.currentIndex], cards))
      }
      setSession(next)
    } finally {
      setSubmitting(false)
    }
  }

  if (!session || cards.length === 0) return <p className="text-center p-8">로딩 중...</p>

  if (session.state === 'completed') {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <ResultReport
          cards={cards}
          results={session.results}
          onRetry={() => router.push(`/test/${setId}`)}
          onBack={() => router.push(`/sets/${setId}`)}
        />
      </main>
    )
  }

  const card = session.cards[session.currentIndex]

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{session.currentIndex + 1} / {session.cards.length}</p>
        <ExamTimer seconds={session.timeRemaining} onTick={handleTick} />
      </div>
      <p className="text-xl font-medium text-center py-8">{card.front}</p>
      <div className="grid grid-cols-2 gap-3">
        {mcqOptions.map(opt => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt === card.back)}
            disabled={submitting}
            className="p-4 rounded-lg border hover:bg-gray-50 text-left disabled:opacity-50"
          >
            {opt}
          </button>
        ))}
      </div>
    </main>
  )
}
