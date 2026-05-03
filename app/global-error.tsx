'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ko">
      <body style={{ backgroundColor: '#fafaf5', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#78716c', fontSize: '0.875rem', marginBottom: '1rem' }}>문제가 발생했습니다</p>
          <button onClick={reset} style={{ border: '1.5px solid #4a4a4a', borderRadius: '3px', padding: '0.25rem 0.75rem', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}>
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
