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
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-6xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">{score}점</p>
        <p className="text-slate-500 mt-2">{total}문제 중 {correct}개 정답</p>
        <div className="flex gap-6 justify-center mt-6">
          <div className="text-center">
            <p className="text-2xl text-emerald-600 font-bold">{correct}</p>
            <p className="text-sm text-slate-500 mt-0.5">정답</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-2xl text-rose-500 font-bold">{incorrect}</p>
            <p className="text-sm text-slate-500 mt-0.5">오답</p>
          </div>
        </div>
      </div>
      {wrongCards.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-700 mb-3">오답 목록</h3>
          <div className="space-y-2">
            {wrongCards.map(c => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 text-sm">
                <p className="font-medium text-slate-900">{c.front}</p>
                <p className="text-slate-500 mt-1">정답: <span className="text-slate-700 font-medium">{c.back}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <button onClick={onRetry} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors">다시 시험</button>
        <button onClick={onBack} className="bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 text-slate-700 transition-colors">세트로 돌아가기</button>
      </div>
    </div>
  )
}
