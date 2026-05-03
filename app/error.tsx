'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-6 text-center">
      <p className="text-stone-500 text-sm">문제가 발생했습니다</p>
      <button onClick={reset} className="btn-note btn-secondary">다시 시도</button>
    </div>
  )
}
