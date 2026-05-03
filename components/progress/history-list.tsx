'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import type { SessionWithSet } from '@/lib/supabase/queries/progress'

function FormattedDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState('')
  useEffect(() => {
    setFormatted(new Date(dateString).toLocaleString('ko-KR'))
  }, [dateString])
  return <span>{formatted}</span>
}

const modeLabel: Record<string, string> = { flip: '카드 뒤집기', mcq: '객관식', short_answer: '주관식', exam: '시험' }

function resumeHref(s: SessionWithSet): string {
  const base = s.mode === 'exam' ? `/test/${s.set_id}` : `/learn/${s.set_id}`
  return `${base}?session=${s.id}`
}

export function HistoryList({ sessions }: { sessions: SessionWithSet[] }) {
  if (sessions.length === 0) return (
    <div className="notebook-paper rounded border border-stone-200 p-12 text-center min-h-40">
      <p className="text-stone-400">학습 기록이 없습니다.</p>
    </div>
  )

  return (
    <div className="border border-stone-200 rounded overflow-hidden">
      {sessions.map((s, i) => (
        <div key={s.id} className={`flex justify-between items-center px-5 py-3 ${i !== 0 ? 'border-t border-stone-100' : ''}`}>
          <div>
            {s.set_title && (
              <p className="text-sm text-stone-400 mb-0.5">{s.set_title}</p>
            )}
            <p className="text-stone-700">{modeLabel[s.mode] ?? s.mode}</p>
            <p className="text-sm text-stone-400 mt-0.5"><FormattedDate dateString={s.started_at} /></p>
          </div>
          <div className="flex items-center gap-2">
            {s.ended_at ? (
              <span className="text-sm text-stone-400">완료</span>
            ) : (
              <>
                <span className="text-sm text-stone-400">미완료</span>
                <Link href={resumeHref(s)} className="btn-note btn-secondary text-sm">이어하기</Link>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
