'use client'
import { useSessionSize } from '@/hooks/use-session-size'

export function SessionSizeControl({ totalCards }: { totalCards: number }) {
  const [sessionSize, setSessionSize] = useSessionSize()
  return (
    <div className="flex items-center gap-3 pt-3 mt-3 border-t border-stone-100">
      <span className="text-sm text-stone-400 flex-1">세션당 카드 수</span>
      <input
        type="number"
        value={sessionSize}
        min={5}
        max={500}
        onChange={e => setSessionSize(Number(e.target.value))}
        className="text-sm text-stone-700 text-center input-note"
        style={{ width: '4rem' }}
      />
      <span className="text-sm text-stone-400">/ {totalCards}개</span>
    </div>
  )
}
