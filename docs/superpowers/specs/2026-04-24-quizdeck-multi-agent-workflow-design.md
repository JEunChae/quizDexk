# quizDeck — Multi-Agent Workflow Design

**Date:** 2026-04-24  
**Stack:** Next.js App Router + Tailwind CSS · Supabase · Vercel  
**Workflow:** Main → 기획자 → 개발자 → 리뷰어 (Claude Code Agent tool, fully automated)

---

## 1. 프로젝트 페이즈

| 페이즈 | 범위 | 의존성 |
|--------|------|--------|
| P1 Foundation | Auth, DB 스키마, 카드 CRUD | 없음 |
| P2 Learning Core | 카드 뒤집기, 객관식/주관식, 셔플, 즐겨찾기 | P1 |
| P3 Test Mode | 시험 모드, 자동 채점, 결과 리포트 | P2 |
| P4 Progress | 진도 저장, 히스토리, 오답 반복, 난이도 표시 | P2 |

---

## 2. 멀티에이전트 워크플로우

```
Main Orchestrator
│
├─ [P1 → P4 루프]
│   ├─ 기획자 에이전트
│   │   ├─ Input : 페이즈 요구사항 + 이전 리뷰 피드백
│   │   ├─ Skills: superpowers:brainstorming → superpowers:writing-plans
│   │   └─ Output: docs/specs/PX-spec.md
│   │
│   ├─ 개발자 에이전트
│   │   ├─ Input : docs/specs/PX-spec.md
│   │   ├─ Skills: superpowers:subagent-driven-development
│   │   │          superpowers:verification-before-completion
│   │   └─ Output: 실제 코드 커밋
│   │
│   └─ 리뷰어 에이전트
│       ├─ Input : 개발된 코드 diff
│       ├─ Skills: superpowers:requesting-code-review
│       └─ Output: docs/reviews/PX-review.md
│
└─ 통과 → 다음 페이즈 / 실패 → 기획자 재작업 (피드백 포함)
```

---

## 3. 에이전트별 역할

### Main Orchestrator
- 페이즈 순서 관리 (P1 → P4)
- 기획자/개발자/리뷰어 에이전트 순차 디스패치
- 리뷰어 판정 읽기 → 통과 or 재작업 결정
- `tasks/todo.md` 전체 진행 상태 기록

### 기획자 에이전트
- `superpowers:brainstorming` → `superpowers:writing-plans` 순서 실행
- `docs/specs/PX-spec.md` 작성
  - 핵심 로직만 수도코드 (CRUD 흐름, 상태 전이, 알고리즘)
  - 자명한 UI 로직 생략
- 재작업 시 리뷰어 피드백을 반영해 spec 수정

### 개발자 에이전트
- spec을 읽고 `superpowers:subagent-driven-development` 실행
- 독립 태스크는 병렬 서브에이전트로 분산
- 완료 전 `superpowers:verification-before-completion` 필수 실행

### 리뷰어 에이전트
- `superpowers:requesting-code-review` 실행
- `docs/reviews/PX-review.md` 작성
  - 판정: **PASS** / **REWORK**
  - REWORK 시: 구체적 수정 항목 리스트
- 패턴 발견 시 `tasks/lessons.md` 업데이트

---

## 4. 앱 아키텍처

```
Next.js App Router
├── app/
│   ├── (auth)/          ← 로그인/회원가입
│   ├── dashboard/       ← 세트 목록, 폴더
│   ├── sets/[id]/       ← 카드 관리
│   ├── learn/[id]/      ← 학습 모드
│   ├── test/[id]/       ← 시험 모드
│   └── history/         ← 학습 기록
├── components/
├── lib/
│   └── supabase/        ← DB 클라이언트, 쿼리
└── types/
```

---

## 5. Supabase DB 스키마

```
users           ← Supabase Auth 관리
sets            (id, user_id, title, folder, tags[], is_public, created_at)
cards           (id, set_id, front, back, difficulty, created_at)
study_sessions  (id, user_id, set_id, mode, started_at, ended_at)
card_results    (id, card_id, session_id, is_correct, answered_at)
bookmarks       (id, user_id, card_id, set_id)
```

---

## 6. 페이즈별 수도코드 대상

| 페이즈 | 수도코드 필수 항목 |
|--------|--------------------|
| P1 | Supabase RLS 정책, Auth 미들웨어 흐름 |
| P2 | 카드 출제 알고리즘 (랜덤/오답 가중치), 난이도 업데이트 흐름 |
| P3 | 채점 로직, 점수 계산식, 시험 상태 전이 (대기→진행→완료) |
| P4 | 오답 기반 복습 우선순위 정렬, 진도율 계산식 |

---

## 7. 파일 규약

```
docs/
├── superpowers/specs/   ← 기획자 출력 (YYYY-MM-DD-PX-*.md)
└── reviews/             ← 리뷰어 출력 (PX-review.md)
tasks/
├── todo.md              ← Main이 관리하는 전체 체크리스트
└── lessons.md           ← 리뷰어가 누적하는 교훈
```
