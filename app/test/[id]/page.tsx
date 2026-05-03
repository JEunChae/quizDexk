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
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSessionSize } from '@/hooks/use-session-size'

const TIME_LIMIT = 300

export default function TestPage() {
  const { id: setId } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resumeSessionId = searchParams.get('session')
  const supabase = useMemo(() => createClient(), [])
  const [sessionSize] = useSessionSize()

  const [cards, setCards] = useState<Card[]>([])
  const [session, setSession] = useState<ExamSession | null>(null)
  const [dbSessionId, setDbSessionId] = useState<string | null>(null)
  const [mcqOptions, setMcqOptions] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const endedRef = useRef(false)
  const submittingCardIdRef = useRef<string | null>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: cardsData } = await supabase.from('cards').select('*').eq('set_id', setId)
      const all = cardsData ?? []

      let drawn: Card[]
      let sessId: string | null

      if (resumeSessionId) {
        const { data: sessionResults } = await supabase
          .from('card_results').select('card_id').eq('session_id', resumeSessionId)
        const answeredIds = new Set((sessionResults ?? []).map(r => r.card_id))
        drawn = all.filter(c => !answeredIds.has(c.id))
        sessId = resumeSessionId
      } else {
        drawn = drawCards(all, [], { shuffle: true, limit: sessionSize })
        await supabase
          .from('study_sessions')
          .update({ ended_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('set_id', setId)
          .is('ended_at', null)
        const { data: sess } = await supabase.from('study_sessions')
          .insert({ user_id: user.id, set_id: setId, mode: 'exam' }).select().single()
        sessId = sess?.id ?? null
      }

      if (drawn.length < 2) { router.push(`/sets/${setId}`); return }
      setCards(drawn)
      setDbSessionId(sessId)
      const examSess = startExam(createExamSession(drawn, TIME_LIMIT))
      setSession(examSess)
      if (drawn[0]) setMcqOptions(generateMCQOptions(drawn[0], drawn))
    }
    init()
  }, [setId, supabase, resumeSessionId])

  const handleTick = useCallback(() => {
    setSession(s => s ? tickTimer(s) : s)
  }, [])

  useEffect(() => {
    if (!session || session.state !== 'completed' || !dbSessionId || endedRef.current) return
    endedRef.current = true

    const answeredIds = new Set(session.results.map(r => r.card_id))
    if (submittingCardIdRef.current) answeredIds.add(submittingCardIdRef.current)
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
    const card = session.cards[session.currentIndex]
    submittingCardIdRef.current = card.id
    try {
      await supabase.from('card_results').insert({ card_id: card.id, session_id: dbSessionId, is_correct: isCorrect })
      const next = answerCard(session, card.id, isCorrect)
      if (next.state !== 'completed') {
        setMcqOptions(generateMCQOptions(next.cards[next.currentIndex], cards))
      }
      setSession(next)
    } finally {
      submittingCardIdRef.current = null
      setSubmitting(false)
    }
  }

  if (!session || cards.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-slate-500">로딩 중...</p>
    </div>
  )

  if (session.state === 'completed') {
    return (
      <main className="max-w-2xl mx-auto px-6 py-8">
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
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-slate-500 font-medium">{session.currentIndex + 1} / {session.cards.length}</p>
        <ExamTimer seconds={session.timeRemaining} onTick={handleTick} />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-xl font-medium text-center text-slate-900 mb-4 min-h-[100px] flex items-center justify-center">
        {card.front}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {mcqOptions.map(opt => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt === card.back)}
            disabled={submitting}
            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-stone-400 text-left text-slate-900 disabled:opacity-50 transition-all"
          >
            {opt}
          </button>
        ))}
      </div>
    </main>
  )
}
