import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import localFont from 'next/font/local'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import './globals.css'

const memoment = localFont({
  src: './fonts/MemomentKkukkukk.otf',
  variable: '--font-memoment',
})

export const metadata: Metadata = {
  title: 'quizDeck',
  description: '플래시카드 기반 학습 앱',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="ko" className={memoment.variable}>
      <body className="min-h-screen" style={{ backgroundColor: '#fafaf5' }}>
        <nav className="border-b border-stone-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10" style={{ backgroundColor: '#fafaf5' }}>
          <Link href="/dashboard" className="font-bold text-xl text-stone-800 tracking-tight">quizDeck</Link>
          <div className="flex gap-5 text-base items-center text-stone-500">
            {user && (
              <>
                <Link href="/dashboard" className="hover:text-stone-900 transition-colors">내 단어장</Link>
                <Link href="/history" className="hover:text-stone-900 transition-colors">학습 기록</Link>
                <span className="text-stone-300">|</span>
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
