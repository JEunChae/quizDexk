import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'quizDeck',
  description: '플래시카드 기반 학습 앱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav className="border-b px-6 py-3 flex items-center justify-between">
          <a href="/dashboard" className="font-bold text-lg text-blue-600">quizDeck</a>
          <div className="flex gap-4 text-sm">
            <a href="/dashboard" className="hover:text-blue-600">내 단어장</a>
            <a href="/history" className="hover:text-blue-600">학습 기록</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
