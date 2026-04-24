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
    <span className={`font-mono text-lg ${urgent ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
      {String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  )
}
