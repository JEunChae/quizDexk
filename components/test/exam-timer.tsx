'use client'
import { useEffect } from 'react'

export function ExamTimer({ seconds, onTick }: { seconds: number; onTick: () => void }) {
  useEffect(() => {
    const id = setInterval(onTick, 1000)
    return () => clearInterval(id)
  }, [onTick])

  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const urgent = seconds <= 30

  return (
    <span className={`font-mono text-lg font-semibold tabular-nums px-3 py-1 rounded-lg ${urgent ? 'text-rose-600 bg-rose-50 border border-rose-200' : 'text-slate-700 bg-slate-100'}`}>
      {String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  )
}
