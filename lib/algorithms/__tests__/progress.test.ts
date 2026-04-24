import { describe, it, expect } from 'vitest'
import { calculateProgress, getReviewPriority } from '../progress'
import type { Card, CardResult } from '@/types/database'

const makeCard = (id: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back: `A${id}`, difficulty: 'medium', created_at: '', updated_at: ''
})
const makeResult = (cardId: string, isCorrect: boolean, t = 0): CardResult => ({
  id: cardId, card_id: cardId, session_id: 's', is_correct: isCorrect,
  answered_at: new Date(t).toISOString()
})

const cards = ['1','2','3','4'].map(makeCard)

describe('calculateProgress', () => {
  it('returns 0 for no results', () => expect(calculateProgress(cards, [])).toBe(0))
  it('returns 50 for half answered', () => {
    const results = [makeResult('1', true), makeResult('2', false)]
    expect(calculateProgress(cards, results)).toBe(50)
  })
  it('returns 100 for all answered', () => {
    const results = cards.map(c => makeResult(c.id, true))
    expect(calculateProgress(cards, results)).toBe(100)
  })
})

describe('getReviewPriority', () => {
  it('puts wrong cards first', () => {
    const results = [makeResult('2', false), makeResult('1', true)]
    const ordered = getReviewPriority(cards, results)
    expect(ordered[0].id).toBe('2')
  })
  it('puts unanswered before correct', () => {
    const results = [makeResult('1', true)]
    const ordered = getReviewPriority(cards, results)
    const ids = ordered.map(c => c.id)
    expect(ids.indexOf('1')).toBeGreaterThan(ids.indexOf('2'))
  })
})
