'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
    if (error) { setError(error.message); setIsLoading(false); return }
    router.refresh()
    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-4">
      <h1 className="text-2xl font-bold">로그인</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="이메일" required
        className="w-full border rounded px-3 py-2 text-gray-900 placeholder:text-gray-400"
      />
      <input
        type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="비밀번호" required
        className="w-full border rounded px-3 py-2 text-gray-900 placeholder:text-gray-400"
      />
      <button
        type="submit" disabled={isLoading}
        className="w-full bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-50"
      >
        {isLoading ? '로그인 중...' : '로그인'}
      </button>
      <p className="text-sm text-center">
        계정이 없으신가요? <Link href="/signup" className="text-blue-600">회원가입</Link>
      </p>
    </form>
  )
}
