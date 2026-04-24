import { describe, it, expect } from 'vitest'
import { createExamSession, startExam, answerCard, tickTimer } from '../exam-state'
import type { Card } from '@/types/database'

const makeCard = (id: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back: `A${id}`, difficulty: 'medium', created_at: '', updated_at: ''
})
const cards = [makeCard('1'), makeCard('2')]

describe('exam state machine', () => {
  it('creates idle session', () => {
    const session = createExamSession(cards, 60)
    expect(session.state).toBe('idle')
    expect(session.timeRemaining).toBe(60)
    expect(session.currentIndex).toBe(0)
    expect(session.results).toHaveLength(0)
  })

  it('starts exam', () => {
    const session = startExam(createExamSession(cards, 60))
    expect(session.state).toBe('running')
  })

  it('advances index on answer', () => {
    let session = startExam(createExamSession(cards, 60))
    session = answerCard(session, '1', true)
    expect(session.currentIndex).toBe(1)
    expect(session.results).toHaveLength(1)
    expect(session.results[0]).toEqual({ card_id: '1', is_correct: true })
  })

  it('completes on last card', () => {
    let session = startExam(createExamSession(cards, 60))
    session = answerCard(session, '1', true)
    session = answerCard(session, '2', false)
    expect(session.state).toBe('completed')
    expect(session.results).toHaveLength(2)
  })

  it('completes on timer expiry', () => {
    let session = startExam(createExamSession(cards, 1))
    session = tickTimer(session)
    expect(session.state).toBe('completed')
    expect(session.timeRemaining).toBe(0)
  })

  it('does not go below 0 on timer', () => {
    let session = startExam(createExamSession(cards, 0))
    session = tickTimer(session)
    expect(session.timeRemaining).toBe(0)
  })

  it('idle session does not start timer on tick', () => {
    const session = tickTimer(createExamSession(cards, 5))
    expect(session.state).toBe('idle')
    expect(session.timeRemaining).toBe(4)
  })
})
