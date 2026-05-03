import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'quizDeck',
    short_name: 'quizDeck',
    description: '플래시카드 기반 학습 앱',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fafaf5',
    theme_color: '#292524',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
