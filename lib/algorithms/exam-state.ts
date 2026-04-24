import type { Card } from '@/types/database'

export interface ExamSession {
  state: 'idle' | 'running' | 'completed'
  currentIndex: number
  timeLimit: number
  timeRemaining: number
  cards: Card[]
  results: Array<{ card_id: string; is_correct: boolean }>
}

export function createExamSession(cards: Card[], timeLimit: number): ExamSession {
  return { state: 'idle', currentIndex: 0, timeLimit, timeRemaining: timeLimit, cards, results: [] }
}

export function startExam(session: ExamSession): ExamSession {
  return { ...session, state: 'running' }
}

export function answerCard(session: ExamSession, cardId: string, isCorrect: boolean): ExamSession {
  const results = [...session.results, { card_id: cardId, is_correct: isCorrect }]
  const nextIndex = session.currentIndex + 1
  return {
    ...session,
    results,
    currentIndex: nextIndex,
    state: nextIndex >= session.cards.length ? 'completed' : 'running',
  }
}

export function tickTimer(session: ExamSession): ExamSession {
  if (session.state === 'completed') return session
  const timeRemaining = Math.max(0, session.timeRemaining - 1)
  const state = timeRemaining === 0 ? 'completed' : session.state
  return { ...session, timeRemaining, state }
}
