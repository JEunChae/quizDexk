'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMemo } from 'react'
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
      // RFC 4180: 따옴표 필드(내부 쉼표 허용) or 일반 필드
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

export function BulkAddForm({ setId }: { setId: string }) {
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
      const parsed = parseCSV(content)
      setPreview(parsed)
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
    if (error) { setError(toKoreanError(error.message, '카드 저장에 실패했습니다. 다시 시도해주세요')); return }
    setSuccess(preview.length)
    setText('')
    setPreview([])
    if (fileRef.current) fileRef.current.value = ''
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* 탭 */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => { setTab('text'); setText(''); setPreview([]) }}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          텍스트 입력
        </button>
        <button
          onClick={() => { setTab('csv'); setText(''); setPreview([]) }}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === 'csv' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          CSV 업로드
        </button>
      </div>

      {/* 텍스트 입력 */}
      {tab === 'text' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">한 줄에 하나씩 <code className="bg-slate-100 px-1 rounded">앞면 : 뒷면</code> 형식으로 입력</p>
          <textarea
            value={text}
            onChange={e => handleTextChange(e.target.value)}
            placeholder={"apple : 사과\nbanana : 바나나\ncherry : 체리"}
            rows={8}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono resize-none"
          />
        </div>
      )}

      {/* CSV 업로드 */}
      {tab === 'csv' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">CSV 파일: <code className="bg-slate-100 px-1 rounded">앞면,뒷면</code> 형식 (헤더 없이)</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
            <span className="text-2xl mb-2">📂</span>
            <span className="text-sm text-slate-600 font-medium">CSV 파일 선택</span>
            <span className="text-xs text-slate-400 mt-1">.csv 파일을 선택하세요</span>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      )}

      {/* 미리보기 */}
      {preview.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
            <span className="text-sm font-medium text-slate-700">미리보기 — {preview.length}개 카드</span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
            {preview.map((card, i) => (
              <div key={i} className="px-4 py-2.5 flex gap-4 text-sm">
                <span className="text-slate-900 flex-1">{card.front}</span>
                <span className="text-slate-400">→</span>
                <span className="text-slate-600 flex-1">{card.back}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 에러 / 성공 */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <p className="text-rose-600 text-sm">{error}</p>
        </div>
      )}
      {success !== null && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-emerald-700 text-sm font-medium">✓ {success}개 카드가 추가됐습니다.</p>
        </div>
      )}

      {/* 추가 버튼 */}
      <button
        onClick={handleSubmit}
        disabled={loading || preview.length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 font-medium transition-colors disabled:opacity-40 text-sm"
      >
        {loading ? '추가 중...' : `카드 ${preview.length}개 추가`}
      </button>
    </div>
  )
}
