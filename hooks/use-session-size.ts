'use client'
import { useEffect, useRef, useState } from 'react'

const KEY = 'quiz_session_size'
const DEFAULT = 20
const MIN = 5

export function useSessionSize(max?: number): [number, (n: number) => void] {
  const [size, setSize] = useState(DEFAULT)
  const initialized = useRef(false)

  // localStorage는 마운트 시 딱 한 번만 읽음 (max 변경에 재실행 안 함)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const stored = localStorage.getItem(KEY)
    if (stored) {
      const n = parseInt(stored, 10)
      if (!isNaN(n)) setSize(Math.max(MIN, n))
    }
  }, [])

  function update(n: number) {
    const clamped = Math.max(MIN, max !== undefined ? Math.min(max, n) : n)
    setSize(clamped)
    localStorage.setItem(KEY, String(clamped))
  }

  // 표시값만 max로 제한 (localStorage 원본은 유지)
  const displaySize = max !== undefined ? Math.min(max, size) : size

  return [displaySize, update]
}
