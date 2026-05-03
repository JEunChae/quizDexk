'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toKoreanError } from '@/lib/utils/error-message'
import { useRouter } from 'next/navigation'

function detectEnv(): 'inapp' | 'ios' | 'android' | 'other' {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  const isInApp = /KAKAOTALK|kakaotalk|Instagram|FBAN|FBAV|Line\/|NaverApp|naver_app/i.test(ua)
  if (isInApp) return 'inapp'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

function InstallGuide() {
  const [prompt, setPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [env, setEnv] = useState<'inapp' | 'ios' | 'android' | 'other'>('other')

  useEffect(() => {
    setEnv(detectEnv())
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setPrompt(null)
  }

  if (installed) {
    return <p className="mt-6 text-center text-xs text-stone-400">설치 완료 ✓</p>
  }

  // 카카오톡·인앱 브라우저: Chrome으로 열도록 안내
  if (env === 'inapp') {
    return (
      <div className="mt-6 text-center">
        <p className="text-xs text-stone-400">
          앱 설치는 <span className="text-stone-600 font-semibold">Chrome</span> 또는{' '}
          <span className="text-stone-600 font-semibold">삼성 인터넷</span>에서 가능합니다
        </p>
        <p className="text-xs text-stone-300 mt-1">우측 상단 ··· → 다른 브라우저로 열기</p>
      </div>
    )
  }

  // Android/Chrome: 직접 설치 버튼
  if (prompt) {
    return (
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleInstall}
          className="text-xs text-stone-500 border border-stone-300 rounded px-3 py-1.5"
        >
          홈 화면에 앱 설치
        </button>
      </div>
    )
  }

  // iOS: 수동 안내
  if (env === 'ios') {
    return (
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setShowGuide(v => !v)}
          className="text-xs text-stone-400 underline underline-offset-2"
        >
          앱으로 설치하는 방법
        </button>
        {showGuide && (
          <div className="mt-3 text-left text-xs text-stone-500 border border-stone-200 rounded p-4 space-y-3">
            <div>
              <p className="font-semibold text-stone-600 mb-1">iPhone · iPad (Safari)</p>
              <p>하단 공유 버튼 <span className="font-mono">□↑</span> → <span className="text-stone-700">홈 화면에 추가</span></p>
            </div>
            <p className="text-stone-400 pt-1 border-t border-stone-100">설치 후 주소창 없이 앱처럼 실행됩니다.</p>
          </div>
        )}
      </div>
    )
  }

  return null
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
        <h1
          className="text-4xl font-bold text-stone-800 inline-block"
          style={{
            backgroundColor: '#fef9c3',
            padding: '2px 16px 6px',
            boxShadow: '3px 3px 7px rgba(0,0,0,0.13)',
            transform: 'rotate(-1.5deg)',
            borderRadius: '1px',
          }}
        >quizDeck</h1>
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
