import type { Card, CardResult } from '@/types/database'

export function calculateProgress(cards: Card[], results: CardResult[]): number {
  if (cards.length === 0) return 0
  const cardIds = new Set(cards.map(c => c.id))
  const answered = new Set(results.filter(r => cardIds.has(r.card_id)).map(r => r.card_id))
  return Math.round(answered.size / cards.length * 100)
}

export function getReviewPriority(cards: Card[], results: CardResult[]): Card[] {
  const latestResult = new Map<string, boolean>()
  for (const r of [...results].sort((a, b) => new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime())) {
    latestResult.set(r.card_id, r.is_correct)
  }
  return [...cards].sort((a, b) => {
    const aV = latestResult.has(a.id) ? (latestResult.get(a.id) ? 2 : 0) : 1
    const bV = latestResult.has(b.id) ? (latestResult.get(b.id) ? 2 : 0) : 1
    return aV - bV
  })
}
