'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setIsLoading(false); return }
    if (!data.session) { setEmailSent(true); setIsLoading(false); return }
    router.refresh()
    router.push('/dashboard')
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-2">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📬</span>
        </div>
        <h1 className="text-xl font-semibold text-slate-700">이메일을 확인해주세요</h1>
        <p className="text-slate-500 text-sm">{email}로 인증 링크를 보냈습니다.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700">quizDeck</h1>
        <p className="text-slate-500 mt-2 text-sm">플래시카드로 스마트하게 학습하세요</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-700">회원가입</h2>
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
          placeholder="비밀번호 (6자 이상)" required minLength={6}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit" disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? '가입 중...' : '가입하기'}
        </button>
        <p className="text-sm text-center text-slate-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">로그인</Link>
        </p>
      </form>
    </div>
  )
}
