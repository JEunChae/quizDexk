import type { Card } from '@/types/database'

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function gradeShortAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
}

export function generateMCQOptions(card: Card, allCards: Card[], count = 4): string[] {
  const distractors = fisherYates(
    allCards.filter(c => c.id !== card.id && c.back !== card.back)
  )
    .slice(0, count - 1)
    .map(c => c.back)
  return fisherYates([...distractors, card.back])
}

export function calculateScore(results: Array<{ is_correct: boolean }>): {
  total: number; correct: number; incorrect: number; score: number
} {
  const total = results.length
  const correct = results.filter(r => r.is_correct).length
  return { total, correct, incorrect: total - correct, score: total > 0 ? Math.round(correct / total * 100) : 0 }
}
