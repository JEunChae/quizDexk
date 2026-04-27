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
      <body>
        <nav className="border-b px-6 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-lg text-blue-600">quizDeck</Link>
          <div className="flex gap-4 text-sm items-center">
            {user && (
              <>
                <Link href="/dashboard" className="hover:text-blue-600">내 단어장</Link>
                <Link href="/history" className="hover:text-blue-600">학습 기록</Link>
                <span className="text-gray-300">|</span>
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
