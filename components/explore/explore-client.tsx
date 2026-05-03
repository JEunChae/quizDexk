'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { FlashSet } from '@/types/database'

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

export function ExploreClient({ sets }: { sets: FlashSet[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? sets.filter(s => {
        const q = query.trim().toLowerCase()
        return (
          s.title.toLowerCase().includes(q) ||
          s.tags.some(t => t.toLowerCase().includes(q))
        )
      })
    : sets

  return (
    <div>
      {/* 검색창 */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="제목 또는 태그 검색"
          className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded bg-transparent text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-400 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"
            aria-label="검색 초기화"
          >✕</button>
        )}
      </div>

      {/* 결과 */}
      {filtered.length === 0 ? (
        <div className="notebook-paper rounded border border-stone-200 p-12 text-center min-h-40">
          <p className="text-stone-400">
            {query.trim() ? `"${query.trim()}"에 대한 결과가 없습니다.` : '아직 공개된 단어장이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {filtered.map(set => (
            <div
              key={set.id}
              className="flex flex-col min-h-[7rem] border border-stone-200 rounded"
              style={{ backgroundColor: '#fafaf5' }}
            >
              <Link href={`/explore/${set.id}`} className="flex-1 block px-5 pt-4 pb-5">
                <h2 className="font-semibold text-stone-800" style={{ fontSize: '1.375rem' }}>{set.title}</h2>
                {set.tags.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {set.tags.map(tag => (
                      <span key={tag} className="text-xs text-stone-500 border border-stone-300 rounded-sm px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
