'use client'
import { useEffect, useState } from 'react'

type FontSize = 'sm' | 'base' | 'lg' | 'xl'

const KEY = 'quiz_font_size'
const DEFAULT: FontSize = 'base'
const SIZES: FontSize[] = ['sm', 'base', 'lg', 'xl']

export function useFontSize(): [FontSize, () => void, () => void] {
  const [size, setSize] = useState<FontSize>(DEFAULT)

  useEffect(() => {
    const stored = localStorage.getItem(KEY) as FontSize | null
    if (stored && SIZES.includes(stored)) setSize(stored)
  }, [])

  function increase() {
    setSize(prev => {
      const next = SIZES[Math.min(SIZES.indexOf(prev) + 1, SIZES.length - 1)]
      localStorage.setItem(KEY, next)
      return next
    })
  }

  function decrease() {
    setSize(prev => {
      const next = SIZES[Math.max(SIZES.indexOf(prev) - 1, 0)]
      localStorage.setItem(KEY, next)
      return next
    })
  }

  return [size, increase, decrease]
}
