'use client'
import { useState } from 'react'

export function PriorityInfo() {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-stone-300 text-xs ml-1 leading-none"
        aria-label="학습 순서 기준 보기"
      >
        ⓘ
      </button>
      {open && (
        <div
          className="absolute left-0 top-5 z-20 rounded border border-stone-200 p-3 text-xs text-stone-500 whitespace-nowrap shadow-sm"
          style={{ backgroundColor: '#fafaf5' }}
        >
          <p className="font-semibold text-stone-700 mb-1.5">학습 카드 순서 기준</p>
          <div className="space-y-0.5">
            <p>① 틀린 카드 — 어려운 순</p>
            <p>② 안 본 카드 — 어려운 순</p>
            <p>③ 맞은 카드 — 어려운 순</p>
          </div>
          <button onClick={() => setOpen(false)} className="mt-2 text-stone-300 text-xs">닫기</button>
        </div>
      )}
    </span>
  )
}
