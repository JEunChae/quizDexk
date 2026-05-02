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
    </div>
  )
}
