import { describe, it, expect } from 'vitest'
import { gradeShortAnswer, generateMCQOptions, calculateScore } from '../grading'
import type { Card, CardResult } from '@/types/database'

const makeCard = (id: string, back: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back, difficulty: 'medium', created_at: '', updated_at: ''
})

describe('gradeShortAnswer', () => {
  it('exact match is correct', () => expect(gradeShortAnswer('apple', 'apple')).toBe(true))
  it('case insensitive', () => expect(gradeShortAnswer('Apple', 'apple')).toBe(true))
  it('trims whitespace', () => expect(gradeShortAnswer(' apple ', 'apple')).toBe(true))
  it('wrong answer is false', () => expect(gradeShortAnswer('banana', 'apple')).toBe(false))
})

describe('generateMCQOptions', () => {
  const cards = ['apple','banana','cherry','date'].map((b, i) => makeCard(String(i), b))
  it('returns 4 options', () => expect(generateMCQOptions(cards[0], cards).length).toBe(4))
  it('contains correct answer', () => expect(generateMCQOptions(cards[0], cards)).toContain('apple'))
  it('has no duplicates', () => {
    const opts = generateMCQOptions(cards[0], cards)
    expect(new Set(opts).size).toBe(4)
  })
})

describe('calculateScore', () => {
  it('calculates percentage', () => {
    const results = [
      { id:'1', card_id:'c1', session_id:'s', is_correct: true, answered_at: '' },
      { id:'2', card_id:'c2', session_id:'s', is_correct: false, answered_at: '' },
    ] as CardResult[]
    const score = calculateScore(results)
    expect(score.score).toBe(50)
    expect(score.correct).toBe(1)
    expect(score.total).toBe(2)
  })
  it('returns 0 for empty results', () => expect(calculateScore([]).score).toBe(0))
})
