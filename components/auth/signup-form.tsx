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
      <div className="bg-white p-8 rounded-lg shadow text-center space-y-2">
        <h1 className="text-2xl font-bold">이메일을 확인해주세요</h1>
        <p className="text-gray-600">{email}로 인증 링크를 보냈습니다.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-4">
      <h1 className="text-2xl font-bold">회원가입</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="이메일" required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="비밀번호 (6자 이상)" required minLength={6}
        className="w-full border rounded px-3 py-2"
      />
      <button
        type="submit" disabled={isLoading}
        className="w-full bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50"
      >
        {isLoading ? '가입 중...' : '가입하기'}
      </button>
      <p className="text-sm text-center">
        이미 계정이 있으신가요? <Link href="/login" className="text-blue-600">로그인</Link>
      </p>
    </form>
  )
}
