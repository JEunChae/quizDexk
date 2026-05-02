'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toKoreanError } from '@/lib/utils/error-message'
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
    if (error) { setError(toKoreanError(error.message)); setIsLoading(false); return }
    if (!data.session) { setEmailSent(true); setIsLoading(false); return }
    router.refresh()
    router.push('/dashboard')
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-sm text-center space-y-3">
        <p className="text-3xl">📬</p>
        <h2 className="text-xl font-semibold text-stone-700">이메일을 확인해주세요</h2>
        <p className="text-stone-400 text-sm">{email}로 인증 링크를 보냈습니다.</p>
      </div>
    )
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
            placeholder="비밀번호 (6자 이상)" required minLength={6}
            className="input-note"
          />
        </div>
        <button type="submit" disabled={isLoading} className="btn-note btn-primary w-full py-2 disabled:opacity-50">
          {isLoading ? '가입 중...' : '가입하기'}
        </button>
        <p className="text-sm text-center text-stone-400">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-stone-600 underline underline-offset-2">로그인</Link>
        </p>
      </form>
    </div>
  )
}
