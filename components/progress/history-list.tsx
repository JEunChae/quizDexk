import type { StudySession } from '@/types/database'

const modeLabel: Record<string, string> = { flip: '카드 뒤집기', mcq: '객관식', short_answer: '주관식', exam: '시험' }

export function HistoryList({ sessions }: { sessions: StudySession[] }) {
  if (sessions.length === 0) return <p className="text-gray-500">학습 기록이 없습니다.</p>

  return (
    <div className="space-y-2">
      {sessions.map(s => (
        <div key={s.id} className="border rounded p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{modeLabel[s.mode] ?? s.mode}</p>
            <p className="text-sm text-gray-500">{new Date(s.started_at).toLocaleString('ko-KR')}</p>
          </div>
          {s.ended_at && (
            <span className="text-xs text-green-600 bg-green-50 rounded px-2 py-1">완료</span>
          )}
        </div>
      ))}
    </div>
  )
}
