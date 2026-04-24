import type { Card, CardResult } from '@/types/database'

export function calculateProgress(cards: Card[], results: CardResult[]): number {
  if (cards.length === 0) return 0
  const answered = new Set(results.map(r => r.card_id))
  return Math.round(answered.size / cards.length * 100)
}

export function getReviewPriority(cards: Card[], results: CardResult[]): Card[] {
  const latestResult = new Map<string, boolean>()
  for (const r of [...results].sort((a, b) => a.answered_at.localeCompare(b.answered_at))) {
    latestResult.set(r.card_id, r.is_correct)
  }
  return [...cards].sort((a, b) => {
    const aV = latestResult.has(a.id) ? (latestResult.get(a.id) ? 2 : 0) : 1
    const bV = latestResult.has(b.id) ? (latestResult.get(b.id) ? 2 : 0) : 1
    return aV - bV
  })
}
