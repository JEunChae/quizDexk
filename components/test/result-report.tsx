import type { Card } from '@/types/database'
import { calculateScore } from '@/lib/algorithms/grading'

export function ResultReport({ cards, results, onRetry, onBack }: {
  cards: Card[]
  results: Array<{ card_id: string; is_correct: boolean }>
  onRetry: () => void
  onBack: () => void
}) {
  const { total, correct, incorrect, score } = calculateScore(results)
  const wrongCards = cards.filter(c => results.find(r => r.card_id === c.id && !r.is_correct))

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <p className="text-5xl font-bold text-blue-600">{score}점</p>
        <p className="text-gray-500 mt-2">{total}문제 중 {correct}개 정답</p>
      </div>
      <div className="flex gap-4 justify-center">
        <div className="text-center"><p className="text-2xl text-green-600 font-semibold">{correct}</p><p className="text-sm text-gray-500">정답</p></div>
        <div className="text-center"><p className="text-2xl text-red-600 font-semibold">{incorrect}</p><p className="text-sm text-gray-500">오답</p></div>
      </div>
      {wrongCards.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">오답 목록</h3>
          <div className="space-y-2">
            {wrongCards.map(c => (
              <div key={c.id} className="border rounded p-3 text-sm">
                <p className="font-medium">{c.front}</p>
                <p className="text-gray-500">정답: {c.back}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <button onClick={onRetry} className="bg-blue-600 text-white rounded px-4 py-2">다시 시험</button>
        <button onClick={onBack} className="border rounded px-4 py-2">세트로 돌아가기</button>
      </div>
    </div>
  )
}
