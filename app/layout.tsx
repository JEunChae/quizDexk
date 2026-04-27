import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import './globals.css'

export const metadata: Metadata = {
  title: 'quizDeck',
  description: '플래시카드 기반 학습 앱',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="ko">
      <body className="bg-slate-50 min-h-screen">
        <nav className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <Link href="/dashboard" className="font-bold text-lg text-indigo-600 tracking-tight">quizDeck</Link>
          <div className="flex gap-5 text-sm items-center">
            {user && (
              <>
                <Link href="/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors">내 단어장</Link>
                <Link href="/history" className="text-slate-600 hover:text-indigo-600 transition-colors">학습 기록</Link>
                <span className="text-slate-200">|</span>
                <LogoutButton />
              </>
            )}
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
