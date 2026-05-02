import type { Card, CardResult } from '@/types/database'

interface DrawOptions {
  shuffle?: boolean
  bookmarkedIds?: Set<string>
  wrongFirst?: boolean
  difficultyFirst?: boolean
  limit?: number
}

const DIFFICULTY_SCORE: Record<string, number> = { hard: 0, medium: 1, easy: 2 }

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

  // 각 카드의 마지막 결과 추출
  const latestResult = new Map<string, boolean>()
  for (const r of [...results].sort((a, b) => new Date(a.answered_at).getTime() - new Date(b.answered_at).getTime())) {
    latestResult.set(r.card_id, r.is_correct)
  }

  // 우선순위 점수: 낮을수록 먼저
  // 결과 점수: 틀림=0, 미학습=1, 맞음=2
  // 난이도 점수: hard=0, medium=1, easy=2
  function priority(card: Card): number {
    const resultScore = !latestResult.has(card.id) ? 1 : latestResult.get(card.id) ? 2 : 0
    const diffScore = options.difficultyFirst ? DIFFICULTY_SCORE[card.difficulty] ?? 1 : 0
    return resultScore * 3 + diffScore
  }

  let result: Card[]

  if (options.wrongFirst || options.difficultyFirst) {
    result = [...pool].sort((a, b) => priority(a) - priority(b))
    // 같은 우선순위 그룹 내에서 shuffle
    if (options.shuffle) {
      const groups = new Map<number, Card[]>()
      for (const card of result) {
        const p = priority(card)
        if (!groups.has(p)) groups.set(p, [])
        groups.get(p)!.push(card)
      }
      result = [...groups.entries()]
        .sort(([a], [b]) => a - b)
        .flatMap(([, g]) => fisherYates(g))
    }
  } else {
    result = options.shuffle ? fisherYates(pool) : pool
  }

  return options.limit ? result.slice(0, options.limit) : result
}
