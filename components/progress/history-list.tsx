import type { SessionWithSet } from '@/lib/supabase/queries/progress'

const modeLabel: Record<string, string> = { flip: '카드 뒤집기', mcq: '객관식', short_answer: '주관식', exam: '시험' }

export function HistoryList({ sessions }: { sessions: SessionWithSet[] }) {
  if (sessions.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
      <p className="text-slate-500">학습 기록이 없습니다.</p>
    </div>
  )

  return (
    <div className="space-y-2">
      {sessions.map(s => (
        <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center hover:shadow-sm transition-all">
          <div>
            {s.set_title && (
              <p className="text-xs text-indigo-600 font-medium mb-0.5">{s.set_title}</p>
            )}
            <p className="font-medium text-slate-700">{modeLabel[s.mode] ?? s.mode}</p>
            <p className="text-sm text-slate-500 mt-0.5">{new Date(s.started_at).toLocaleString('ko-KR')}</p>
          </div>
          {s.ended_at && (
            <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 font-medium">완료</span>
          )}
        </div>
      ))}
    </div>
  )
}
