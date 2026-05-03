'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toKoreanError } from '@/lib/utils/error-message'
import { useRouter } from 'next/navigation'

function InstallGuide() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="text-xs text-stone-400 underline underline-offset-2"
      >
        앱으로 설치하는 방법
      </button>
      {open && (
        <div className="mt-3 text-left text-xs text-stone-500 border border-stone-200 rounded p-4 space-y-3">
          <div>
            <p className="font-semibold text-stone-600 mb-1">iPhone · iPad (Safari)</p>
            <p>하단 공유 버튼 <span className="font-mono">□↑</span> → <span className="text-stone-700">홈 화면에 추가</span></p>
          </div>
          <div>
            <p className="font-semibold text-stone-600 mb-1">Android (Chrome)</p>
            <p>우측 상단 <span className="font-mono">⋮</span> → <span className="text-stone-700">홈 화면에 추가</span> 또는 <span className="text-stone-700">앱 설치</span></p>
          </div>
          <p className="text-stone-400 pt-1 border-t border-stone-100">설치 후 주소창 없이 앱처럼 실행됩니다.</p>
        </div>
      )}
    </div>
  )
}

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(toKoreanError(error.message)); setIsLoading(false); return }
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-stone-800">quizDeck</h1>
        <p className="text-stone-400 mt-2 text-base">나만의 단어장</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {error && <p className="text-sm text-stone-500">{error}</p>}
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="이메일" required
            className="input-note"
          />
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호" required
            className="input-note"
          />
        </div>
        <button type="submit" disabled={isLoading} className="btn-note btn-primary w-full py-2 disabled:opacity-50">
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        <p className="text-sm text-center text-stone-400">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-stone-600 underline underline-offset-2">회원가입</Link>
        </p>
      </form>
      <InstallGuide />
    </div>
  )
}
