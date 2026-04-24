import type { Card, CardResult } from '@/types/database'

interface DrawOptions {
  shuffle?: boolean
  bookmarkedIds?: Set<string>
  wrongFirst?: boolean
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function drawCards(cards: Card[], results: CardResult[], options: DrawOptions): Card[] {
  let pool = options.bookmarkedIds
    ? cards.filter(c => options.bookmarkedIds!.has(c.id))
    : [...cards]

  if (options.wrongFirst) {
    const wrongIds = new Set(results.filter(r => !r.is_correct).map(r => r.card_id))
    const wrong = pool.filter(c => wrongIds.has(c.id))
    const rest = pool.filter(c => !wrongIds.has(c.id))
    return options.shuffle
      ? [...fisherYates(wrong), ...fisherYates(rest)]
      : [...wrong, ...rest]
  }

  return options.shuffle ? fisherYates(pool) : pool
}
