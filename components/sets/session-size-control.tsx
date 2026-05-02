'use client'
import { useState, useEffect } from 'react'
import { useSessionSize } from '@/hooks/use-session-size'

export function SessionSizeControl({ totalCards }: { totalCards: number }) {
  const [sessionSize, setSessionSize] = useSessionSize(totalCards)
  const [draft, setDraft] = useState(String(sessionSize))

  useEffect(() => {
    setDraft(String(sessionSize))
  }, [sessionSize])

  function commit(value: string) {
    const n = parseInt(value, 10)
    if (!isNaN(n)) setSessionSize(n)
    else setDraft(String(sessionSize))
  }

  return (
    <div className="flex items-center gap-3 pt-3 mt-3 border-t border-stone-100">
      <span className="text-sm text-stone-400 flex-1">세션당 카드 수</span>
      <input
        type="number"
        value={draft}
        min={5}
        max={totalCards}
        onChange={e => setDraft(e.target.value)}
        onBlur={e => commit(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') commit((e.target as HTMLInputElement).value) }}
        className="text-sm text-stone-700 text-center input-note"
        style={{ width: '4rem' }}
      />
      <span className="text-sm text-stone-400">/ {totalCards}개</span>
    </div>
  )
}
