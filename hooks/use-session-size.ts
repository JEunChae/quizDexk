'use client'
import { useEffect, useState } from 'react'

const KEY = 'quiz_session_size'
const DEFAULT = 20
const MIN = 5
const MAX = 500

export function useSessionSize(): [number, (n: number) => void] {
  const [size, setSize] = useState(DEFAULT)

  useEffect(() => {
    const stored = localStorage.getItem(KEY)
    if (stored) {
      const n = parseInt(stored, 10)
      if (!isNaN(n)) setSize(Math.max(MIN, Math.min(MAX, n)))
    }
  }, [])

  function update(n: number) {
    const clamped = Math.max(MIN, Math.min(MAX, n))
    setSize(clamped)
    localStorage.setItem(KEY, String(clamped))
  }

  return [size, update]
}
