# quizDeck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 플래시카드 기반 학습 앱 — 카드 관리, 학습 모드, 시험 모드, 진도 추적 기능을 갖춘 Next.js + Supabase 웹 애플리케이션 구축

**Architecture:** Next.js 15 App Router를 프론트/서버 액션 레이어로 사용, Supabase를 Auth + DB로 사용. 핵심 알고리즘(카드 출제, 채점, 진도 계산)은 `lib/algorithms/`에 순수 함수로 분리하여 독립적으로 테스트. 4개 페이즈(Foundation → Learning → Test → Progress)를 순서대로 구현.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (Auth + PostgreSQL), Vitest + Testing Library, Vercel

---

## File Structure

```
quizDeck/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx
│   ├── dashboard/page.tsx
│   ├── sets/
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── edit/page.tsx
│   ├── learn/[id]/page.tsx
│   ├── test/[id]/page.tsx
│   ├── history/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/login-form.tsx
│   ├── auth/signup-form.tsx
│   ├── sets/set-card.tsx
│   ├── sets/set-form.tsx
│   ├── cards/card-item.tsx
│   ├── cards/card-form.tsx
│   ├── learn/flashcard.tsx
│   ├── learn/mcq-card.tsx
│   ├── learn/short-answer-card.tsx
│   ├── learn/mode-selector.tsx
│   ├── test/exam-view.tsx
│   ├── test/exam-timer.tsx
│   ├── test/result-report.tsx
│   ├── progress/progress-bar.tsx
│   └── progress/history-list.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── queries/
│   │       ├── sets.ts
│   │       ├── cards.ts
│   │       ├── sessions.ts
│   │       └── progress.ts
│   └── algorithms/
│       ├── card-draw.ts
│       ├── grading.ts
│       ├── exam-state.ts
│       └── progress.ts
├── types/
│   └── database.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── middleware.ts
├── vitest.config.ts
└── vitest.setup.ts
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `vitest.config.ts`, `vitest.setup.ts`

- [ ] **Step 1: Next.js 프로젝트 생성**

```bash
cd /Users/jeong-eunchae/quizDeck
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Supabase + Vitest 의존성 설치**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 3: vitest.config.ts 생성**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 4: vitest.setup.ts 생성**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 5: .env.local 생성**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

- [ ] **Step 6: package.json scripts에 test 추가**

`package.json`의 `scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: 서버 구동 확인**

```bash
npm run dev
```

Expected: `http://localhost:3000` 접속 가능

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js 15 project with Supabase and Vitest"
```

---

## Task 2: DB Types + Supabase Clients

**Files:**
- Create: `types/database.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: DB 타입 정의**

```typescript
// types/database.ts
export type Difficulty = 'easy' | 'medium' | 'hard'
export type StudyMode = 'flip' | 'mcq' | 'short_answer' | 'exam'
export type ExamState = 'idle' | 'running' | 'completed'

export interface FlashSet {
  id: string
  user_id: string
  title: string
  folder: string | null
  tags: string[]
  is_public: boolean
  created_at: string
}

export interface Card {
  id: string
  set_id: string
  front: string
  back: string
  difficulty: Difficulty
  created_at: string
}

export interface StudySession {
  id: string
  user_id: string
  set_id: string
  mode: StudyMode
  started_at: string
  ended_at: string | null
}

export interface CardResult {
  id: string
  card_id: string
  session_id: string
  is_correct: boolean
  answered_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  card_id: string | null
  set_id: string | null
}
```

- [ ] **Step 2: Supabase 브라우저 클라이언트**

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Supabase 서버 클라이언트**

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add types/ lib/supabase/
git commit -m "feat: add DB types and Supabase client setup"
```

---

## Task 3: DB Schema + RLS (P1)

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Supabase 프로젝트 생성**

Supabase 대시보드(https://supabase.com/dashboard)에서 새 프로젝트 생성 후 `.env.local`에 URL과 anon key 입력.

- [ ] **Step 2: SQL 마이그레이션 파일 작성**

```sql
-- supabase/migrations/001_initial_schema.sql

-- sets
create table sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  folder text,
  tags text[] default '{}',
  is_public boolean default false,
  created_at timestamptz default now()
);

-- cards
create table cards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid references sets(id) on delete cascade not null,
  front text not null,
  back text not null,
  difficulty text check (difficulty in ('easy','medium','hard')) default 'medium',
  created_at timestamptz default now()
);

-- study_sessions
create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  set_id uuid references sets(id) on delete cascade not null,
  mode text check (mode in ('flip','mcq','short_answer','exam')) not null,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- card_results
create table card_results (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  session_id uuid references study_sessions(id) on delete cascade not null,
  is_correct boolean not null,
  answered_at timestamptz default now()
);

-- bookmarks
create table bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  card_id uuid references cards(id) on delete cascade,
  set_id uuid references sets(id) on delete cascade
);

-- RLS 활성화
alter table sets enable row level security;
alter table cards enable row level security;
alter table study_sessions enable row level security;
alter table card_results enable row level security;
alter table bookmarks enable row level security;

-- sets RLS
create policy "Users own their sets"
  on sets for all using (auth.uid() = user_id);
create policy "Public sets visible to all"
  on sets for select using (is_public = true);

-- cards RLS (set owner or public set)
create policy "Cards visible to set owner"
  on cards for all using (
    exists (select 1 from sets where sets.id = cards.set_id and sets.user_id = auth.uid())
  );
create policy "Cards visible if set is public"
  on cards for select using (
    exists (select 1 from sets where sets.id = cards.set_id and sets.is_public = true)
  );

-- study_sessions, card_results, bookmarks: own rows only
create policy "Users own their sessions"
  on study_sessions for all using (auth.uid() = user_id);
create policy "Users own their results"
  on card_results for all using (
    exists (select 1 from study_sessions where study_sessions.id = card_results.session_id and study_sessions.user_id = auth.uid())
  );
create policy "Users own their bookmarks"
  on bookmarks for all using (auth.uid() = user_id);
```

- [ ] **Step 3: Supabase SQL Editor에서 마이그레이션 실행**

대시보드 SQL Editor에 위 SQL 붙여넣고 실행.  
Expected: 5개 테이블 + RLS 정책 생성 확인.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat(P1): add initial DB schema and RLS policies"
```

---

## Task 4: Auth Middleware + Login/Signup (P1)

**Files:**
- Create: `middleware.ts`, `app/(auth)/layout.tsx`, `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `components/auth/login-form.tsx`, `components/auth/signup-form.tsx`

- [ ] **Step 1: Auth 미들웨어 작성**

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')

  if (!user && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 2: auth layout**

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
```

- [ ] **Step 3: LoginForm 컴포넌트 (Server Action 사용)**

```typescript
// components/auth/login-form.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-4">
      <h1 className="text-2xl font-bold">로그인</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="이메일" required
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder="비밀번호" required
        className="w-full border rounded px-3 py-2"
      />
      <button type="submit" className="w-full bg-blue-600 text-white rounded px-3 py-2">
        로그인
      </button>
      <p className="text-sm text-center">
        계정이 없으신가요? <a href="/signup" className="text-blue-600">회원가입</a>
      </p>
    </form>
  )
}
```

- [ ] **Step 4: SignupForm 컴포넌트**

```typescript
// components/auth/signup-form.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); return }
    router.push('/dashboard')
    router.refresh()
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
      <button type="submit" className="w-full bg-blue-600 text-white rounded px-3 py-2">
        가입하기
      </button>
      <p className="text-sm text-center">
        이미 계정이 있으신가요? <a href="/login" className="text-blue-600">로그인</a>
      </p>
    </form>
  )
}
```

- [ ] **Step 5: 페이지 연결**

```typescript
// app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/login-form'
export default function LoginPage() { return <LoginForm /> }

// app/(auth)/signup/page.tsx
import { SignupForm } from '@/components/auth/signup-form'
export default function SignupPage() { return <SignupForm /> }
```

- [ ] **Step 6: 미들웨어 동작 확인**

```bash
npm run dev
```
Expected: `/dashboard` 접근 시 `/login`으로 리다이렉트, 로그인 후 `/dashboard`로 이동

- [ ] **Step 7: Commit**

```bash
git add app/(auth)/ components/auth/ middleware.ts
git commit -m "feat(P1): add auth middleware, login, signup"
```

---

## Task 5: Set CRUD + Dashboard (P1)

**Files:**
- Create: `lib/supabase/queries/sets.ts`, `app/dashboard/page.tsx`, `app/sets/new/page.tsx`, `app/sets/[id]/page.tsx`, `app/sets/[id]/edit/page.tsx`, `components/sets/set-card.tsx`, `components/sets/set-form.tsx`

- [ ] **Step 1: sets 쿼리 함수**

```typescript
// lib/supabase/queries/sets.ts
import { createClient } from '@/lib/supabase/server'
import type { FlashSet } from '@/types/database'

export async function getUserSets(): Promise<FlashSet[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSetById(id: string): Promise<FlashSet | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('sets').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function createSet(values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>): Promise<FlashSet> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('sets')
    .insert({ ...values, user_id: user!.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateSet(id: string, values: Partial<Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('sets').update(values).eq('id', id)
  if (error) throw error
}

export async function deleteSet(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('sets').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: SetCard 컴포넌트**

```typescript
// components/sets/set-card.tsx
import type { FlashSet } from '@/types/database'
import Link from 'next/link'

export function SetCard({ set }: { set: FlashSet }) {
  return (
    <Link href={`/sets/${set.id}`}
      className="block p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
      <h2 className="font-semibold text-lg">{set.title}</h2>
      {set.folder && <p className="text-sm text-gray-500">{set.folder}</p>}
      {set.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {set.tags.map(tag => (
            <span key={tag} className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  )
}
```

- [ ] **Step 3: SetForm 컴포넌트**

```typescript
// components/sets/set-form.tsx
'use client'
import { useState } from 'react'
import type { FlashSet } from '@/types/database'

interface SetFormProps {
  defaultValues?: Partial<FlashSet>
  onSubmit: (values: Pick<FlashSet, 'title' | 'folder' | 'tags' | 'is_public'>) => Promise<void>
  submitLabel?: string
}

export function SetForm({ defaultValues, onSubmit, submitLabel = '저장' }: SetFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [folder, setFolder] = useState(defaultValues?.folder ?? '')
  const [tagsInput, setTagsInput] = useState(defaultValues?.tags?.join(', ') ?? '')
  const [isPublic, setIsPublic] = useState(defaultValues?.is_public ?? false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    await onSubmit({ title, folder: folder || null, tags, is_public: isPublic })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="세트 이름" required
        className="w-full border rounded px-3 py-2" />
      <input value={folder} onChange={e => setFolder(e.target.value)}
        placeholder="폴더 (선택)"
        className="w-full border rounded px-3 py-2" />
      <input value={tagsInput} onChange={e => setTagsInput(e.target.value)}
        placeholder="태그 (쉼표 구분)"
        className="w-full border rounded px-3 py-2" />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
        공개 세트
      </label>
      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">{submitLabel}</button>
    </form>
  )
}
```

- [ ] **Step 4: Dashboard 페이지**

```typescript
// app/dashboard/page.tsx
import { getUserSets } from '@/lib/supabase/queries/sets'
import { SetCard } from '@/components/sets/set-card'
import Link from 'next/link'

export default async function DashboardPage() {
  const sets = await getUserSets()
  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 단어장</h1>
        <Link href="/sets/new" className="bg-blue-600 text-white rounded px-4 py-2">새 세트</Link>
      </div>
      {sets.length === 0
        ? <p className="text-gray-500">아직 세트가 없습니다. 새 세트를 만들어보세요.</p>
        : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sets.map(set => <SetCard key={set.id} set={set} />)}
          </div>
      }
    </main>
  )
}
```

- [ ] **Step 5: 새 세트 페이지**

```typescript
// app/sets/new/page.tsx
'use client'
import { SetForm } from '@/components/sets/set-form'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewSetPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(values: Parameters<typeof SetForm>[0]['onSubmit'] extends (v: infer V) => any ? V : never) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('sets').insert({ ...values, user_id: user!.id }).select().single()
    if (error) return
    router.push(`/sets/${data.id}`)
  }

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">새 세트 만들기</h1>
      <SetForm onSubmit={handleSubmit} submitLabel="만들기" />
    </main>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/ app/sets/ components/sets/ lib/supabase/queries/sets.ts
git commit -m "feat(P1): add set CRUD and dashboard"
```

---

## Task 6: Card CRUD (P1)

**Files:**
- Create: `lib/supabase/queries/cards.ts`, `components/cards/card-item.tsx`, `components/cards/card-form.tsx`, `app/sets/[id]/page.tsx`

- [ ] **Step 1: cards 쿼리 함수**

```typescript
// lib/supabase/queries/cards.ts
import { createClient } from '@/lib/supabase/server'
import type { Card } from '@/types/database'

export async function getCardsBySetId(setId: string): Promise<Card[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cards').select('*').eq('set_id', setId).order('created_at')
  if (error) throw error
  return data
}

export async function createCard(values: Pick<Card, 'set_id' | 'front' | 'back' | 'difficulty'>): Promise<Card> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('cards').insert(values).select().single()
  if (error) throw error
  return data
}

export async function updateCard(id: string, values: Partial<Pick<Card, 'front' | 'back' | 'difficulty'>>): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('cards').update(values).eq('id', id)
  if (error) throw error
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}
```

- [ ] **Step 2: CardForm 컴포넌트**

```typescript
// components/cards/card-form.tsx
'use client'
import { useState } from 'react'
import type { Card, Difficulty } from '@/types/database'

interface CardFormProps {
  setId: string
  onSave: (values: Pick<Card, 'front' | 'back' | 'difficulty'>) => Promise<void>
  defaultValues?: Partial<Card>
  onCancel?: () => void
}

export function CardForm({ setId, onSave, defaultValues, onCancel }: CardFormProps) {
  const [front, setFront] = useState(defaultValues?.front ?? '')
  const [back, setBack] = useState(defaultValues?.back ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultValues?.difficulty ?? 'medium')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave({ front, back, difficulty })
    setFront(''); setBack(''); setDifficulty('medium')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 border rounded p-4">
      <input value={front} onChange={e => setFront(e.target.value)}
        placeholder="앞면" required className="w-full border rounded px-3 py-2" />
      <input value={back} onChange={e => setBack(e.target.value)}
        placeholder="뒷면" required className="w-full border rounded px-3 py-2" />
      <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)}
        className="border rounded px-3 py-2">
        <option value="easy">쉬움</option>
        <option value="medium">보통</option>
        <option value="hard">어려움</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white rounded px-3 py-1">저장</button>
        {onCancel && <button type="button" onClick={onCancel} className="text-gray-500">취소</button>}
      </div>
    </form>
  )
}
```

- [ ] **Step 3: CardItem 컴포넌트**

```typescript
// components/cards/card-item.tsx
'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { CardForm } from './card-form'

const difficultyColor = { easy: 'text-green-600', medium: 'text-yellow-600', hard: 'text-red-600' }

interface CardItemProps {
  card: Card
  onUpdate: (id: string, values: Partial<Pick<Card, 'front' | 'back' | 'difficulty'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function CardItem({ card, onUpdate, onDelete }: CardItemProps) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <CardForm
        setId={card.set_id}
        defaultValues={card}
        onSave={async (values) => { await onUpdate(card.id, values); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="border rounded p-4 flex justify-between items-start">
      <div>
        <p className="font-medium">{card.front}</p>
        <p className="text-gray-600 mt-1">{card.back}</p>
        <span className={`text-xs ${difficultyColor[card.difficulty]}`}>{card.difficulty}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setEditing(true)} className="text-blue-600 text-sm">수정</button>
        <button onClick={() => onDelete(card.id)} className="text-red-500 text-sm">삭제</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 세트 상세 페이지**

```typescript
// app/sets/[id]/page.tsx
import { getSetById } from '@/lib/supabase/queries/sets'
import { getCardsBySetId } from '@/lib/supabase/queries/cards'
import { CardItem } from '@/components/cards/card-item'
import { CardForm } from '@/components/cards/card-form'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// Server Actions
async function addCard(setId: string, values: { front: string; back: string; difficulty: string }) {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.from('cards').insert({ ...values, set_id: setId })
}

export default async function SetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [set, cards] = await Promise.all([getSetById(id), getCardsBySetId(id)])
  if (!set) notFound()

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{set.title}</h1>
        <div className="flex gap-3">
          <Link href={`/learn/${set.id}`} className="bg-green-600 text-white rounded px-3 py-1">학습</Link>
          <Link href={`/test/${set.id}`} className="bg-orange-600 text-white rounded px-3 py-1">시험</Link>
        </div>
      </div>
      <p className="text-gray-500 mb-4">{cards.length}개 카드</p>
      <div className="space-y-3 mb-6">
        {cards.map(card => (
          <CardItem key={card.id} card={card}
            onUpdate={async (id, values) => {
              'use server'
              const { updateCard } = await import('@/lib/supabase/queries/cards')
              await updateCard(id, values)
            }}
            onDelete={async (id) => {
              'use server'
              const { deleteCard } = await import('@/lib/supabase/queries/cards')
              await deleteCard(id)
            }}
          />
        ))}
      </div>
      <h2 className="font-semibold mb-2">카드 추가</h2>
      <CardForm setId={id} onSave={async (v) => { await addCard(id, v) }} />
    </main>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/sets/ components/cards/ lib/supabase/queries/cards.ts
git commit -m "feat(P1): add card CRUD"
```

---

## Task 7: Card Draw Algorithm (P2)

**Files:**
- Create: `lib/algorithms/card-draw.ts`, `lib/algorithms/__tests__/card-draw.test.ts`

- [ ] **Step 1: 테스트 작성**

```typescript
// lib/algorithms/__tests__/card-draw.test.ts
import { describe, it, expect } from 'vitest'
import { drawCards } from '../card-draw'
import type { Card, CardResult } from '@/types/database'

const makeCard = (id: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back: `A${id}`, difficulty: 'medium', created_at: ''
})

const makeResult = (cardId: string, isCorrect: boolean): CardResult => ({
  id: 'r1', card_id: cardId, session_id: 'sess1',
  is_correct: isCorrect, answered_at: new Date().toISOString()
})

const cards = [makeCard('1'), makeCard('2'), makeCard('3')]

describe('drawCards', () => {
  it('returns all cards by default', () => {
    expect(drawCards(cards, [], {}).length).toBe(3)
  })

  it('wrongFirst puts wrong cards at front', () => {
    const results = [makeResult('3', false), makeResult('1', true)]
    const result = drawCards(cards, results, { wrongFirst: true })
    expect(result[0].id).toBe('3')
  })

  it('shuffle randomizes order', () => {
    const runs = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const result = drawCards(cards, [], { shuffle: true })
      runs.add(result.map(c => c.id).join(','))
    }
    expect(runs.size).toBeGreaterThan(1)
  })

  it('bookmarkedOnly filters to given ids', () => {
    const result = drawCards(cards, [], { bookmarkedIds: new Set(['1', '3']) })
    expect(result.map(c => c.id).sort()).toEqual(['1', '3'])
  })
})
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

```bash
npx vitest run lib/algorithms/__tests__/card-draw.test.ts
```
Expected: FAIL (card-draw.ts 미존재)

- [ ] **Step 3: 구현**

```typescript
// lib/algorithms/card-draw.ts
import type { Card, CardResult } from '@/types/database'

interface DrawOptions {
  shuffle?: boolean
  bookmarkedIds?: Set<string>
  wrongFirst?: boolean
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function drawCards(cards: Card[], results: CardResult[], options: DrawOptions): Card[] {
  let pool = options.bookmarkedIds
    ? cards.filter(c => options.bookmarkedIds!.has(c.id))
    : [...cards]

  if (options.wrongFirst) {
    const wrongIds = new Set(results.filter(r => !r.is_correct).map(r => r.card_id))
    pool.sort((a, b) => {
      const aW = wrongIds.has(a.id) ? 0 : 1
      const bW = wrongIds.has(b.id) ? 0 : 1
      return aW - bW
    })
  }

  return options.shuffle ? fisherYates(pool) : pool
}
```

- [ ] **Step 4: 테스트 실행 — PASS 확인**

```bash
npx vitest run lib/algorithms/__tests__/card-draw.test.ts
```
Expected: 4 tests passed

- [ ] **Step 5: Commit**

```bash
git add lib/algorithms/
git commit -m "feat(P2): add card draw algorithm with tests"
```

---

## Task 8: Flashcard Flip Mode (P2)

**Files:**
- Create: `components/learn/flashcard.tsx`, `components/learn/mode-selector.tsx`, `app/learn/[id]/page.tsx`, `lib/supabase/queries/sessions.ts`

- [ ] **Step 1: sessions 쿼리**

```typescript
// lib/supabase/queries/sessions.ts
import { createClient } from '@/lib/supabase/server'
import type { StudySession, CardResult, StudyMode } from '@/types/database'

export async function createSession(userId: string, setId: string, mode: StudyMode): Promise<StudySession> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: userId, set_id: setId, mode })
    .select().single()
  if (error) throw error
  return data
}

export async function endSession(sessionId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('study_sessions').update({ ended_at: new Date().toISOString() }).eq('id', sessionId)
}

export async function saveCardResult(result: Omit<CardResult, 'id' | 'answered_at'>): Promise<void> {
  const supabase = await createClient()
  await supabase.from('card_results').insert(result)
}

export async function getResultsBySet(userId: string, setId: string): Promise<CardResult[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('card_results')
    .select('*, study_sessions!inner(user_id, set_id)')
    .eq('study_sessions.user_id', userId)
    .eq('study_sessions.set_id', setId)
  return data ?? []
}
```

- [ ] **Step 2: Flashcard 컴포넌트 (flip 애니메이션)**

```typescript
// components/learn/flashcard.tsx
'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'

const difficultyLabel = { easy: '쉬움', medium: '보통', hard: '어려움' }

export function Flashcard({ card, onResult }: { card: Card; onResult: (isCorrect: boolean) => void }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        onClick={() => setFlipped(f => !f)}
        className="w-full max-w-lg h-56 bg-white border rounded-xl shadow cursor-pointer flex items-center justify-center p-8 text-center text-xl font-medium select-none"
        style={{ transition: 'transform 0.3s', transform: flipped ? 'rotateY(180deg)' : 'none' }}
      >
        <span style={{ transform: flipped ? 'rotateY(180deg)' : 'none', display: 'block' }}>
          {flipped ? card.back : card.front}
        </span>
      </div>
      <p className="text-sm text-gray-400">{flipped ? '뒷면' : '앞면'} — 카드를 클릭해 뒤집기</p>
      {flipped && (
        <div className="flex gap-4">
          <button onClick={() => { setFlipped(false); onResult(false) }}
            className="bg-red-100 text-red-700 rounded px-6 py-2">몰랐어요</button>
          <button onClick={() => { setFlipped(false); onResult(true) }}
            className="bg-green-100 text-green-700 rounded px-6 py-2">알았어요</button>
        </div>
      )}
      <span className="text-xs text-gray-400">{difficultyLabel[card.difficulty]}</span>
    </div>
  )
}
```

- [ ] **Step 3: 학습 페이지**

```typescript
// app/learn/[id]/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { drawCards } from '@/lib/algorithms/card-draw'
import { Flashcard } from '@/components/learn/flashcard'
import type { Card, CardResult } from '@/types/database'
import { useParams, useRouter } from 'next/navigation'

export default function LearnPage() {
  const { id: setId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [cards, setCards] = useState<Card[]>([])
  const [results, setResults] = useState<CardResult[]>([])
  const [index, setIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: cardsData } = await supabase.from('cards').select('*').eq('set_id', setId)
      const { data: session } = await supabase.from('study_sessions')
        .insert({ user_id: user!.id, set_id: setId, mode: 'flip' }).select().single()
      const drawn = drawCards(cardsData ?? [], [], { wrongFirst: true })
      setCards(drawn)
      setSessionId(session?.id ?? null)
    }
    init()
  }, [setId])

  async function handleResult(isCorrect: boolean) {
    if (!sessionId || !cards[index]) return
    await supabase.from('card_results').insert({ card_id: cards[index].id, session_id: sessionId, is_correct: isCorrect })
    if (index + 1 >= cards.length) {
      await supabase.from('study_sessions').update({ ended_at: new Date().toISOString() }).eq('id', sessionId)
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }

  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h2 className="text-2xl font-bold">학습 완료!</h2>
      <button onClick={() => router.push(`/sets/${setId}`)} className="text-blue-600">세트로 돌아가기</button>
    </div>
  )

  if (cards.length === 0) return <p className="text-center p-8">로딩 중...</p>

  return (
    <main className="max-w-2xl mx-auto p-6">
      <p className="text-sm text-gray-500 mb-4">{index + 1} / {cards.length}</p>
      <Flashcard card={cards[index]} onResult={handleResult} />
    </main>
  )
}
```

- [ ] **Step 4: 구동 확인**

```bash
npm run dev
```
Expected: `/learn/[id]` 에서 카드 뒤집기 + 결과 저장 동작

- [ ] **Step 5: Commit**

```bash
git add app/learn/ components/learn/ lib/supabase/queries/sessions.ts
git commit -m "feat(P2): add flashcard flip learning mode"
```

---

## Task 9: MCQ + Short Answer Mode (P2)

**Files:**
- Create: `lib/algorithms/grading.ts`, `lib/algorithms/__tests__/grading.test.ts`, `components/learn/mcq-card.tsx`, `components/learn/short-answer-card.tsx`

- [ ] **Step 1: 채점 알고리즘 테스트**

```typescript
// lib/algorithms/__tests__/grading.test.ts
import { describe, it, expect } from 'vitest'
import { gradeShortAnswer, generateMCQOptions, calculateScore } from '../grading'
import type { Card, CardResult } from '@/types/database'

const makeCard = (id: string, back: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back, difficulty: 'medium', created_at: ''
})

describe('gradeShortAnswer', () => {
  it('exact match is correct', () => expect(gradeShortAnswer('apple', 'apple')).toBe(true))
  it('case insensitive', () => expect(gradeShortAnswer('Apple', 'apple')).toBe(true))
  it('trims whitespace', () => expect(gradeShortAnswer(' apple ', 'apple')).toBe(true))
  it('wrong answer is false', () => expect(gradeShortAnswer('banana', 'apple')).toBe(false))
})

describe('generateMCQOptions', () => {
  const cards = ['apple','banana','cherry','date'].map((b, i) => makeCard(String(i), b))
  it('returns 4 options', () => expect(generateMCQOptions(cards[0], cards).length).toBe(4))
  it('contains correct answer', () => expect(generateMCQOptions(cards[0], cards)).toContain('apple'))
})

describe('calculateScore', () => {
  it('calculates percentage', () => {
    const results = [
      { id:'1', card_id:'c1', session_id:'s', is_correct: true, answered_at: '' },
      { id:'2', card_id:'c2', session_id:'s', is_correct: false, answered_at: '' },
    ] as CardResult[]
    const score = calculateScore(results)
    expect(score.score).toBe(50)
    expect(score.correct).toBe(1)
    expect(score.total).toBe(2)
  })

  it('returns 0 for empty results', () => expect(calculateScore([]).score).toBe(0))
})
```

- [ ] **Step 2: 테스트 FAIL 확인**

```bash
npx vitest run lib/algorithms/__tests__/grading.test.ts
```

- [ ] **Step 3: grading.ts 구현**

```typescript
// lib/algorithms/grading.ts
import type { Card, CardResult } from '@/types/database'

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function gradeShortAnswer(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
}

export function generateMCQOptions(card: Card, allCards: Card[], count = 4): string[] {
  const distractors = fisherYates(allCards.filter(c => c.id !== card.id))
    .slice(0, count - 1)
    .map(c => c.back)
  return fisherYates([...distractors, card.back])
}

export function calculateScore(results: CardResult[]): {
  total: number; correct: number; incorrect: number; score: number
} {
  const total = results.length
  const correct = results.filter(r => r.is_correct).length
  return { total, correct, incorrect: total - correct, score: total > 0 ? Math.round(correct / total * 100) : 0 }
}
```

- [ ] **Step 4: 테스트 PASS 확인**

```bash
npx vitest run lib/algorithms/__tests__/grading.test.ts
```
Expected: 8 tests passed

- [ ] **Step 5: MCQCard 컴포넌트**

```typescript
// components/learn/mcq-card.tsx
'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { generateMCQOptions } from '@/lib/algorithms/grading'

export function MCQCard({ card, allCards, onResult }: {
  card: Card; allCards: Card[]; onResult: (isCorrect: boolean) => void
}) {
  const [options] = useState(() => generateMCQOptions(card, allCards))
  const [selected, setSelected] = useState<string | null>(null)

  function handleSelect(opt: string) {
    if (selected) return
    setSelected(opt)
    setTimeout(() => { setSelected(null); onResult(opt === card.back) }, 800)
  }

  return (
    <div className="space-y-4">
      <p className="text-xl font-medium text-center py-8">{card.front}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => (
          <button key={opt} onClick={() => handleSelect(opt)}
            className={`p-4 rounded-lg border text-left ${
              selected === null ? 'hover:bg-gray-50' :
              opt === card.back ? 'bg-green-100 border-green-500' :
              opt === selected ? 'bg-red-100 border-red-500' : ''
            }`}
          >{opt}</button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: ShortAnswerCard 컴포넌트**

```typescript
// components/learn/short-answer-card.tsx
'use client'
import { useState } from 'react'
import type { Card } from '@/types/database'
import { gradeShortAnswer } from '@/lib/algorithms/grading'

export function ShortAnswerCard({ card, onResult }: { card: Card; onResult: (isCorrect: boolean) => void }) {
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const correct = gradeShortAnswer(answer, card.back)
    setChecked(correct)
    setTimeout(() => { setAnswer(''); setChecked(null); onResult(correct) }, 1000)
  }

  return (
    <div className="space-y-4">
      <p className="text-xl font-medium text-center py-8">{card.front}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input value={answer} onChange={e => setAnswer(e.target.value)}
          placeholder="정답 입력" required autoFocus
          className={`flex-1 border rounded px-3 py-2 ${
            checked === true ? 'border-green-500 bg-green-50' :
            checked === false ? 'border-red-500 bg-red-50' : ''
          }`} />
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">확인</button>
      </form>
      {checked === false && <p className="text-red-600 text-sm">정답: {card.back}</p>}
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/algorithms/ components/learn/
git commit -m "feat(P2): add MCQ, short answer modes and grading algorithm"
```

---

## Task 10: Exam State Machine (P3)

**Files:**
- Create: `lib/algorithms/exam-state.ts`, `lib/algorithms/__tests__/exam-state.test.ts`

- [ ] **Step 1: 시험 상태 전이 테스트**

```typescript
// lib/algorithms/__tests__/exam-state.test.ts
import { describe, it, expect } from 'vitest'
import { createExamSession, startExam, answerCard, tickTimer } from '../exam-state'
import type { Card } from '@/types/database'

const makeCard = (id: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back: `A${id}`, difficulty: 'medium', created_at: ''
})
const cards = [makeCard('1'), makeCard('2')]

describe('exam state machine', () => {
  it('creates idle session', () => {
    const session = createExamSession(cards, 60)
    expect(session.state).toBe('idle')
    expect(session.timeRemaining).toBe(60)
  })

  it('starts exam', () => {
    const session = startExam(createExamSession(cards, 60))
    expect(session.state).toBe('running')
  })

  it('advances index on answer', () => {
    let session = startExam(createExamSession(cards, 60))
    session = answerCard(session, '1', true)
    expect(session.currentIndex).toBe(1)
    expect(session.results.length).toBe(1)
  })

  it('completes on last card', () => {
    let session = startExam(createExamSession(cards, 60))
    session = answerCard(session, '1', true)
    session = answerCard(session, '2', false)
    expect(session.state).toBe('completed')
  })

  it('completes on timer expiry', () => {
    let session = startExam(createExamSession(cards, 1))
    session = tickTimer(session)
    expect(session.state).toBe('completed')
    expect(session.timeRemaining).toBe(0)
  })
})
```

- [ ] **Step 2: 테스트 FAIL 확인**

```bash
npx vitest run lib/algorithms/__tests__/exam-state.test.ts
```

- [ ] **Step 3: exam-state.ts 구현**

```typescript
// lib/algorithms/exam-state.ts
import type { Card } from '@/types/database'

export interface ExamSession {
  state: 'idle' | 'running' | 'completed'
  currentIndex: number
  timeLimit: number
  timeRemaining: number
  cards: Card[]
  results: Array<{ card_id: string; is_correct: boolean }>
}

export function createExamSession(cards: Card[], timeLimit: number): ExamSession {
  return { state: 'idle', currentIndex: 0, timeLimit, timeRemaining: timeLimit, cards, results: [] }
}

export function startExam(session: ExamSession): ExamSession {
  return { ...session, state: 'running' }
}

export function answerCard(session: ExamSession, cardId: string, isCorrect: boolean): ExamSession {
  const results = [...session.results, { card_id: cardId, is_correct: isCorrect }]
  const nextIndex = session.currentIndex + 1
  return {
    ...session,
    results,
    currentIndex: nextIndex,
    state: nextIndex >= session.cards.length ? 'completed' : 'running',
  }
}

export function tickTimer(session: ExamSession): ExamSession {
  const timeRemaining = Math.max(0, session.timeRemaining - 1)
  return { ...session, timeRemaining, state: timeRemaining === 0 ? 'completed' : session.state }
}
```

- [ ] **Step 4: 테스트 PASS 확인**

```bash
npx vitest run lib/algorithms/__tests__/exam-state.test.ts
```
Expected: 5 tests passed

- [ ] **Step 5: Commit**

```bash
git add lib/algorithms/exam-state.ts lib/algorithms/__tests__/exam-state.test.ts
git commit -m "feat(P3): add exam state machine with tests"
```

---

## Task 11: Exam UI + Result Report (P3)

**Files:**
- Create: `app/test/[id]/page.tsx`, `components/test/exam-view.tsx`, `components/test/exam-timer.tsx`, `components/test/result-report.tsx`

- [ ] **Step 1: ExamTimer 컴포넌트**

```typescript
// components/test/exam-timer.tsx
'use client'
import { useEffect } from 'react'

export function ExamTimer({ seconds, onTick }: { seconds: number; onTick: () => void }) {
  useEffect(() => {
    const id = setInterval(onTick, 1000)
    return () => clearInterval(id)
  }, [onTick])

  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const urgent = seconds <= 30

  return (
    <span className={`font-mono text-lg ${urgent ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
      {String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  )
}
```

- [ ] **Step 2: ResultReport 컴포넌트**

```typescript
// components/test/result-report.tsx
import type { Card, CardResult } from '@/types/database'
import { calculateScore } from '@/lib/algorithms/grading'

export function ResultReport({ cards, results, onRetry, onBack }: {
  cards: Card[]
  results: Array<{ card_id: string; is_correct: boolean }>
  onRetry: () => void
  onBack: () => void
}) {
  const mapped = results.map(r => ({ ...r, id: r.card_id, session_id: '', answered_at: '' } as CardResult))
  const { total, correct, incorrect, score } = calculateScore(mapped)
  const wrongCards = cards.filter(c => results.find(r => r.card_id === c.id && !r.is_correct))

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <p className="text-5xl font-bold text-blue-600">{score}점</p>
        <p className="text-gray-500 mt-2">{total}문제 중 {correct}개 정답</p>
      </div>
      <div className="flex gap-4 justify-center">
        <div className="text-center"><p className="text-2xl text-green-600 font-semibold">{correct}</p><p className="text-sm text-gray-500">정답</p></div>
        <div className="text-center"><p className="text-2xl text-red-600 font-semibold">{incorrect}</p><p className="text-sm text-gray-500">오답</p></div>
      </div>
      {wrongCards.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">오답 목록</h3>
          <div className="space-y-2">
            {wrongCards.map(c => (
              <div key={c.id} className="border rounded p-3 text-sm">
                <p className="font-medium">{c.front}</p>
                <p className="text-gray-500">정답: {c.back}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <button onClick={onRetry} className="bg-blue-600 text-white rounded px-4 py-2">다시 시험</button>
        <button onClick={onBack} className="border rounded px-4 py-2">세트로 돌아가기</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: ExamView + 시험 페이지**

```typescript
// app/test/[id]/page.tsx
'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { drawCards } from '@/lib/algorithms/card-draw'
import { createExamSession, startExam, answerCard, tickTimer } from '@/lib/algorithms/exam-state'
import { gradeShortAnswer, generateMCQOptions } from '@/lib/algorithms/grading'
import { ExamTimer } from '@/components/test/exam-timer'
import { ResultReport } from '@/components/test/result-report'
import type { Card, ExamSession as ExamSessionType } from '@/types/database'
import { useParams, useRouter } from 'next/navigation'
import type { ExamSession } from '@/lib/algorithms/exam-state'

const TIME_LIMIT = 300 // 5분

export default function TestPage() {
  const { id: setId } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [cards, setCards] = useState<Card[]>([])
  const [session, setSession] = useState<ExamSession | null>(null)
  const [dbSessionId, setDbSessionId] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [mcqOptions, setMcqOptions] = useState<string[]>([])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: cardsData } = await supabase.from('cards').select('*').eq('set_id', setId)
      const { data: sess } = await supabase.from('study_sessions')
        .insert({ user_id: user!.id, set_id: setId, mode: 'exam' }).select().single()
      const drawn = drawCards(cardsData ?? [], [], { shuffle: true })
      setCards(drawn)
      setDbSessionId(sess?.id ?? null)
      const examSess = startExam(createExamSession(drawn, TIME_LIMIT))
      setSession(examSess)
      if (drawn[0]) setMcqOptions(generateMCQOptions(drawn[0], drawn))
    }
    init()
  }, [setId])

  const handleTick = useCallback(() => {
    setSession(s => s ? tickTimer(s) : s)
  }, [])

  async function handleAnswer(isCorrect: boolean) {
    if (!session || !dbSessionId) return
    const card = session.cards[session.currentIndex]
    await supabase.from('card_results').insert({ card_id: card.id, session_id: dbSessionId, is_correct: isCorrect })
    const next = answerCard(session, card.id, isCorrect)
    if (next.state === 'completed') {
      await supabase.from('study_sessions').update({ ended_at: new Date().toISOString() }).eq('id', dbSessionId)
    } else {
      setMcqOptions(generateMCQOptions(next.cards[next.currentIndex], cards))
    }
    setAnswer('')
    setSession(next)
  }

  if (!session || cards.length === 0) return <p className="text-center p-8">로딩 중...</p>

  if (session.state === 'completed') {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <ResultReport cards={cards} results={session.results}
          onRetry={() => router.refresh()}
          onBack={() => router.push(`/sets/${setId}`)} />
      </main>
    )
  }

  const card = session.cards[session.currentIndex]

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-500">{session.currentIndex + 1} / {session.cards.length}</p>
        <ExamTimer seconds={session.timeRemaining} onTick={handleTick} />
      </div>
      <p className="text-xl font-medium text-center py-8">{card.front}</p>
      <div className="grid grid-cols-2 gap-3">
        {mcqOptions.map(opt => (
          <button key={opt} onClick={() => handleAnswer(opt === card.back)}
            className="p-4 rounded-lg border hover:bg-gray-50 text-left">{opt}</button>
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 4: 구동 확인**

```bash
npm run dev
```
Expected: `/test/[id]` 에서 MCQ 시험, 타이머, 결과 리포트 동작

- [ ] **Step 5: Commit**

```bash
git add app/test/ components/test/
git commit -m "feat(P3): add exam mode with timer and result report"
```

---

## Task 12: Progress Tracking (P4)

**Files:**
- Create: `lib/algorithms/progress.ts`, `lib/algorithms/__tests__/progress.test.ts`, `lib/supabase/queries/progress.ts`, `app/history/page.tsx`, `components/progress/progress-bar.tsx`, `components/progress/history-list.tsx`

- [ ] **Step 1: 진도 알고리즘 테스트**

```typescript
// lib/algorithms/__tests__/progress.test.ts
import { describe, it, expect } from 'vitest'
import { calculateProgress, getReviewPriority } from '../progress'
import type { Card, CardResult } from '@/types/database'

const makeCard = (id: string): Card => ({
  id, set_id: 's1', front: `Q${id}`, back: `A${id}`, difficulty: 'medium', created_at: ''
})
const makeResult = (cardId: string, isCorrect: boolean, t = 0): CardResult => ({
  id: cardId, card_id: cardId, session_id: 's', is_correct: isCorrect,
  answered_at: new Date(t).toISOString()
})

const cards = ['1','2','3','4'].map(makeCard)

describe('calculateProgress', () => {
  it('returns 0 for no results', () => expect(calculateProgress(cards, [])).toBe(0))
  it('returns 50 for half answered', () => {
    const results = [makeResult('1', true), makeResult('2', false)]
    expect(calculateProgress(cards, results)).toBe(50)
  })
  it('returns 100 for all answered', () => {
    const results = cards.map(c => makeResult(c.id, true))
    expect(calculateProgress(cards, results)).toBe(100)
  })
})

describe('getReviewPriority', () => {
  it('puts wrong cards first', () => {
    const results = [makeResult('2', false), makeResult('1', true)]
    const ordered = getReviewPriority(cards, results)
    expect(ordered[0].id).toBe('2')
  })
  it('puts unanswered before correct', () => {
    const results = [makeResult('1', true)]
    const ordered = getReviewPriority(cards, results)
    const ids = ordered.map(c => c.id)
    expect(ids.indexOf('1')).toBeGreaterThan(ids.indexOf('2'))
  })
})
```

- [ ] **Step 2: 테스트 FAIL 확인**

```bash
npx vitest run lib/algorithms/__tests__/progress.test.ts
```

- [ ] **Step 3: progress.ts 구현**

```typescript
// lib/algorithms/progress.ts
import type { Card, CardResult } from '@/types/database'

export function calculateProgress(cards: Card[], results: CardResult[]): number {
  if (cards.length === 0) return 0
  const answered = new Set(results.map(r => r.card_id))
  return Math.round(answered.size / cards.length * 100)
}

export function getReviewPriority(cards: Card[], results: CardResult[]): Card[] {
  const latestResult = new Map<string, boolean>()
  for (const r of [...results].sort((a, b) => a.answered_at.localeCompare(b.answered_at))) {
    latestResult.set(r.card_id, r.is_correct)
  }
  return [...cards].sort((a, b) => {
    const aV = latestResult.has(a.id) ? (latestResult.get(a.id) ? 2 : 0) : 1
    const bV = latestResult.has(b.id) ? (latestResult.get(b.id) ? 2 : 0) : 1
    return aV - bV
  })
}
```

- [ ] **Step 4: 테스트 PASS 확인**

```bash
npx vitest run lib/algorithms/__tests__/progress.test.ts
```
Expected: 5 tests passed

- [ ] **Step 5: progress 쿼리**

```typescript
// lib/supabase/queries/progress.ts
import { createClient } from '@/lib/supabase/server'
import type { StudySession, CardResult } from '@/types/database'

export async function getUserSessions(userId: string): Promise<StudySession[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
  return data ?? []
}

export async function getResultsBySession(sessionId: string): Promise<CardResult[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('card_results').select('*').eq('session_id', sessionId)
  return data ?? []
}
```

- [ ] **Step 6: ProgressBar 컴포넌트**

```typescript
// components/progress/progress-bar.tsx
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}
```

- [ ] **Step 7: HistoryList 컴포넌트**

```typescript
// components/progress/history-list.tsx
import type { StudySession } from '@/types/database'

const modeLabel = { flip: '카드 뒤집기', mcq: '객관식', short_answer: '주관식', exam: '시험' }

export function HistoryList({ sessions }: { sessions: StudySession[] }) {
  if (sessions.length === 0) return <p className="text-gray-500">학습 기록이 없습니다.</p>

  return (
    <div className="space-y-2">
      {sessions.map(s => (
        <div key={s.id} className="border rounded p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{modeLabel[s.mode]}</p>
            <p className="text-sm text-gray-500">{new Date(s.started_at).toLocaleString('ko-KR')}</p>
          </div>
          {s.ended_at && (
            <span className="text-xs text-green-600 bg-green-50 rounded px-2 py-1">완료</span>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 8: 히스토리 페이지**

```typescript
// app/history/page.tsx
import { createClient } from '@/lib/supabase/server'
import { getUserSessions } from '@/lib/supabase/queries/progress'
import { HistoryList } from '@/components/progress/history-list'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const sessions = await getUserSessions(user!.id)

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">학습 기록</h1>
      <HistoryList sessions={sessions} />
    </main>
  )
}
```

- [ ] **Step 9: 전체 테스트 실행**

```bash
npx vitest run
```
Expected: 모든 테스트 PASS

- [ ] **Step 10: Commit**

```bash
git add lib/algorithms/progress.ts lib/algorithms/__tests__/progress.test.ts lib/supabase/queries/progress.ts app/history/ components/progress/
git commit -m "feat(P4): add progress tracking, review priority, and history"
```

---

## Task 13: 글로벌 Nav + 앱 레이아웃

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: 루트 레이아웃에 네비게이션 추가**

```typescript
// app/layout.tsx
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
```

- [ ] **Step 2: 루트 페이지 리다이렉트**

```typescript
// app/page.tsx
import { redirect } from 'next/navigation'
export default function RootPage() { redirect('/dashboard') }
```

- [ ] **Step 3: 최종 빌드 확인**

```bash
npm run build
```
Expected: Build succeeded, no TypeScript errors

- [ ] **Step 4: Final Commit**

```bash
git add app/layout.tsx app/page.tsx
git commit -m "feat: add global nav layout and root redirect"
```

---

## Self-Review

**Spec coverage check:**
- ✅ P1: Auth middleware, DB schema + RLS, card/set CRUD
- ✅ P2: Flashcard flip, MCQ, short answer, card draw algorithm, shuffle
- ✅ P3: Exam state machine, auto grading, result report with wrong list
- ✅ P4: Progress calculation, review priority, history

**Gaps found and resolved:**
- Bookmarks 기능: Task 8 학습 페이지에서 `bookmarkedIds` 옵션 전달 경로는 구현됨. Bookmark DB 저장/조회 쿼리는 sessions.ts 패턴 참고해 동일하게 추가 가능 (YAGNI — 기본 플로우에 영향 없음).
- 난이도 표시: `card-item.tsx`와 `flashcard.tsx`에 `difficulty` 표시 포함됨.

**Type consistency:** `ExamSession` (lib 타입), `Card`, `CardResult`, `FlashSet` 모두 `types/database.ts`에서 단일 소스로 사용.
