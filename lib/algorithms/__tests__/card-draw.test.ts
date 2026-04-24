import { describe, it, expect } from 'vitest'
import { drawCards } from '../card-draw'
import type { Card, CardResult } from '@/types/database'

const makeCard = (id: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back: `A${id}`, difficulty: 'medium', created_at: '', updated_at: ''
})

const makeResult = (cardId: string, isCorrect: boolean): CardResult => ({
  id: 'r1', card_id: cardId, session_id: 'sess1',
  is_correct: isCorrect, answered_at: new Date().toISOString()
})

const cards = [makeCard('1'), makeCard('2'), makeCard('3')]

describe('drawCards', () => {
  it('returns all cards by default', () => {
    expect(drawCards(cards, [], {}).length).toBe(3)
  })

  it('wrongFirst puts wrong cards at front', () => {
    const results = [makeResult('3', false), makeResult('1', true)]
    const result = drawCards(cards, results, { wrongFirst: true })
    expect(result[0].id).toBe('3')
  })

  it('shuffle randomizes order', () => {
    const runs = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const result = drawCards(cards, [], { shuffle: true })
      runs.add(result.map(c => c.id).join(','))
    }
    expect(runs.size).toBeGreaterThan(1)
  })

  it('bookmarkedOnly filters to given ids', () => {
    const result = drawCards(cards, [], { bookmarkedIds: new Set(['1', '3']) })
    expect(result.map(c => c.id).sort()).toEqual(['1', '3'])
  })

  it('wrongFirst + shuffle keeps wrong partition before correct partition', () => {
    const results = [makeResult('1', false), makeResult('2', false)]
    const wrongSet = new Set(['1', '2'])
    for (let i = 0; i < 30; i++) {
      const result = drawCards(cards, results, { wrongFirst: true, shuffle: true })
      const firstCorrectIndex = result.findIndex(c => !wrongSet.has(c.id))
      const lastWrongIndex = result.map(c => wrongSet.has(c.id)).lastIndexOf(true)
      expect(lastWrongIndex).toBeLessThan(firstCorrectIndex)
    }
  })
})
