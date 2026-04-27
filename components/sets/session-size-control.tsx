'use client'
import { useSessionSize } from '@/hooks/use-session-size'

export function SessionSizeControl({ totalCards }: { totalCards: number }) {
  const [sessionSize, setSessionSize] = useSessionSize()
  return (
    <div className="flex items-center gap-3 pt-3 mt-3 border-t border-slate-100">
      <span className="text-sm text-slate-500 flex-1">세션당 카드 수</span>
      <input
        type="number"
        value={sessionSize}
        min={5}
        max={500}
        onChange={e => setSessionSize(Number(e.target.value))}
        className="w-20 border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-sm text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <span className="text-sm text-slate-400">/ {totalCards}개</span>
    </div>
  )
}
