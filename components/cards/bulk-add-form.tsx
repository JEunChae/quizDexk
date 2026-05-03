'use client'
import { useRef, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toKoreanError } from '@/lib/utils/error-message'

type ParsedCard = { front: string; back: string }

function parseCSVField(s: string): string {
  s = s.trim()
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/""/g, '"')
  return s
}

function parseCSV(text: string): ParsedCard[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .flatMap(line => {
      const match = line.match(/^("(?:[^"]|"")*"|[^,]+),("(?:[^"]|"")*"|.+)$/)
      if (!match) return []
      const front = parseCSVField(match[1])
      const back = parseCSVField(match[2])
      return front && back ? [{ front, back }] : []
    })
}

function parseText(text: string): ParsedCard[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .flatMap(line => {
      const sep = line.includes(' : ') ? ' : ' : line.includes(':') ? ':' : null
      if (!sep) return []
      const idx = line.indexOf(sep)
      const front = line.slice(0, idx).trim()
      const back = line.slice(idx + sep.length).trim()
      return front && back ? [{ front, back }] : []
    })
}

export function BulkAddForm({ setId, onSuccess }: { setId: string; onSuccess?: () => void }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<'text' | 'csv'>('text')
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<ParsedCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleTextChange(val: string) {
    setText(val)
    setPreview(parseText(val))
    setError(null)
    setSuccess(null)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const content = ev.target?.result as string
      setPreview(parseCSV(content))
      setError(null)
      setSuccess(null)
    }
    reader.readAsText(file, 'utf-8')
  }

  async function handleSubmit() {
    if (preview.length === 0) { setError('추가할 카드가 없습니다.'); return }
    setLoading(true)
    setError(null)
    const rows = preview.map(c => ({ set_id: setId, front: c.front, back: c.back, difficulty: 'medium' as const }))
    const { error } = await supabase.from('cards').insert(rows)
    setLoading(false)
    if (error) { setError(toKoreanError(error.message, '카드 저장에 실패했습니다')); return }
    router.refresh()
    onSuccess?.()
  }

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="flex gap-3 border-b border-stone-200 pb-1">
        <button
          onClick={() => { setTab('text'); setText(''); setPreview([]) }}
          className={`text-sm pb-1 transition-colors ${tab === 'text' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-400'}`}
        >
          텍스트 입력
        </button>
        <button
          onClick={() => { setTab('csv'); setText(''); setPreview([]) }}
          className={`text-sm pb-1 transition-colors ${tab === 'csv' ? 'text-stone-800 border-b-2 border-stone-800' : 'text-stone-400'}`}
        >
          CSV 업로드
        </button>
      </div>

      {/* 텍스트 입력 */}
      {tab === 'text' && (
        <div className="space-y-2">
          <p className="text-xs text-stone-400">한 줄에 하나씩 <code>앞면 : 뒷면</code> 형식</p>
          <textarea
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            placeholder={"apple : 사과\nbanana : 바나나"}
            rows={8}
            className="w-full border-b border-stone-300 bg-transparent text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:border-stone-600 resize-none py-1"
            style={{ fontFamily: 'var(--font-memoment), cursive' }}
          />
        </div>
      )}

      {/* CSV 업로드 */}
      {tab === 'csv' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-400">CSV: <code>앞면,뒷면</code> 형식 (헤더 없이)</p>
            <button
              onClick={() => {
                const sample = 'apple,사과\nbanana,바나나\nvocabulary,어휘\nsubsequently,그 다음에\nacknowledge,인정하다'
                const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'sample.csv'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="text-xs text-stone-400 underline underline-offset-2"
            >
              샘플 다운로드
            </button>
          </div>
          <label className="flex flex-col items-center justify-center border border-dashed border-stone-300 rounded p-8 cursor-pointer">
            <span className="text-2xl mb-2">📂</span>
            <span className="text-sm text-stone-500">CSV 파일 선택</span>
            <span className="text-xs text-stone-400 mt-1">.csv 파일</span>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      )}

      {/* 미리보기 */}
      {preview.length > 0 && (
        <div className="border border-stone-200 rounded overflow-hidden">
          <div className="px-4 py-2 border-b border-stone-100">
            <span className="text-sm text-stone-500">미리보기 — {preview.length}개</span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-stone-100">
            {preview.map((card, i) => (
              <div key={i} className="px-4 py-2 flex gap-4 text-sm">
                <span className="text-stone-800 flex-1">{card.front}</span>
                <span className="text-stone-300">→</span>
                <span className="text-stone-500 flex-1">{card.back}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-stone-500">{error}</p>}
      {success !== null && <p className="text-sm text-stone-500">✓ {success}개 카드 추가됨</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || preview.length === 0}
        className="btn-note btn-primary w-full py-2 disabled:opacity-40"
      >
        {loading ? '추가 중...' : `카드 ${preview.length}개 추가`}
      </button>
    </div>
  )
}
