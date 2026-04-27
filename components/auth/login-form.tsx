'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toKoreanError } from '@/lib/utils/error-message'
import { useRouter } from 'next/navigation'

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
    if (error) { console.error('login error:', error.message, error); setError(toKoreanError(error.message)); setIsLoading(false); return }
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700">quizDeck</h1>
        <p className="text-slate-500 mt-2 text-sm">플래시카드로 스마트하게 학습하세요</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">로그인</h2>
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
            <p className="text-rose-600 text-sm">{error}</p>
          </div>
        )}
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="이메일" required
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호" required
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit" disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        <p className="text-sm text-center text-slate-500">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-indigo-600 font-medium hover:underline">회원가입</Link>
        </p>
      </form>
    </div>
  )
}
