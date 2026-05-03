'use client'
import type { Card } from '@/types/database'
import { useFontSize } from '@/hooks/use-font-size'

function SpeakerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  )
}

const FONT_CLASS = {
  sm:   'text-[clamp(0.65rem,2vw,0.875rem)]',
  base: 'text-[clamp(0.75rem,2.5vw,1rem)]',
  lg:   'text-[clamp(0.875rem,3vw,1.125rem)]',
  xl:   'text-[clamp(1rem,3.5vw,1.25rem)]',
}

function detectLang(text: string): string | null {
  if (/[가-힣ㄱ-ㅣ]/.test(text)) return null
  if (/[぀-ヿ]/.test(text)) return 'ja-JP'
  if (/[一-鿿]/.test(text)) return 'zh-CN'
  if (/[a-zA-Z]/.test(text)) return 'en-US'
  return null
}

function PublicCardItem({ card }: { card: Card }) {
  const lang = detectLang(card.front)

  function speak() {
    if (!lang) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(card.front)
    u.lang = lang
    window.speechSynthesis.speak(u)
  }

  return (
    <div style={{ display: 'contents' }}>
      <div className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 shrink-0 block mt-[0.35rem]" />
        <span className="font-en font-bold text-slate-800 whitespace-nowrap">{card.front}</span>
        {lang && (
          <button onClick={speak} className="text-slate-500 shrink-0" aria-label="발음 듣기">
            <SpeakerIcon />
          </button>
        )}
      </div>
      <span className="font-ko text-slate-700 whitespace-nowrap">{card.back}</span>
    </div>
  )
}

export function PublicCardList({ cards }: { cards: Card[] }) {
  const [fontSize, increaseFontSize, decreaseFontSize] = useFontSize()

  return (
    <div className="border border-stone-200 rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-stone-700 font-semibold">단어 목록</span>
          <span className="text-sm text-stone-400">{cards.length}개</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={decreaseFontSize}
            className="text-stone-400 text-xs px-1.5 py-0.5 rounded border border-stone-200 leading-none"
            aria-label="글자 작게"
          >A-</button>
          <button
            onClick={increaseFontSize}
            className="text-stone-400 text-sm px-1.5 py-0.5 rounded border border-stone-200 leading-none"
            aria-label="글자 크게"
          >A+</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div
          className={`notebook-paper pr-4 py-1 ${FONT_CLASS[fontSize]}`}
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto auto',
            columnGap: '1rem',
            width: 'max-content',
            minWidth: '100%',
          }}
        >
          {cards.length === 0 ? (
            <p className="text-stone-400 text-center py-6" style={{ gridColumn: 'span 2' }}>카드가 없습니다.</p>
          ) : (
            cards.map(card => <PublicCardItem key={card.id} card={card} />)
          )}
        </div>
      </div>
    </div>
  )
}
