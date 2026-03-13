# Vocabularium — Project Plan

## Tech Stack
- **Framework**: Next.js 16 (App Router, Server Components, Server Actions)
- **Styling**: TailwindCSS 4 with CSS custom properties for theming
- **Database**: PostgreSQL via Supabase (pooled connections)
- **ORM**: Prisma 6
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Storage**: Supabase Storage (avatar uploads)
- **Guest Mode**: IndexedDB via `idb-keyval` (local-first for unauthenticated users)
- **Deployment**: Vercel

---

## Phase 1 — MVP (COMPLETE)

- Project scaffolding with Next.js App Router + Prisma + Supabase PostgreSQL
- Prisma schema: `Word` model (word, meaningEn, meaningBn, partOfSpeech, explanation, examples, tags)
- Add Word page (`/add`) with full form + Server Action
- Words list page (`/words`) with search, sort (alphabetical/chronological/by-tag), filter
- Word detail page (`/words/[id]`) with edit and delete
- Bottom navigation bar (Home, Add, Words, Quiz, Profile)
- Dark/light/system theme toggle
- Mobile-first responsive design with loading skeletons
- Toast notifications, card hover effects, glass morphism
- Deployed to Vercel

---

## Phase 2 — Auth + Guest Mode + Local-First Storage (COMPLETE)

### Sprint 1: Foundation
- Updated schema with `User` model (Supabase Auth UUID), `userId` on Word
- Supabase client helpers (browser + server + middleware)
- IndexedDB layer (`lib/local-words.js`) for guest word storage
- Auth middleware for route protection

### Sprint 2: Auth Pages
- Signup page with full name, email/password, Google OAuth
- Login page with email/password, Google OAuth
- Email confirmation flow (`/auth/confirm`, `/auth/callback`)
- `NEXT_PUBLIC_SITE_URL` env var for environment-aware redirect URLs

### Sprint 3: Server Actions + Migration
- All Server Actions scoped by `userId` (words CRUD)
- `ensureUserExists` upsert pattern to keep email synced
- `migrateLocalWords` — moves IndexedDB words to DB on first login
- `useRef` guard to prevent duplicate migration on multiple auth events

### Sprint 4: Guest/Auth Page Branching
- All pages branch: Server Component checks auth → renders auth or guest Client Component
- Guest components load data from IndexedDB, show skeletons while loading
- Pattern: `page.js` (server) → `PageContent.js` (shared UI) + `GuestPage.js` (IndexedDB loader)

### Sprint 5: Profile Page + BottomNav
- Profile page with avatar upload (Supabase Storage), inline name editing, theme toggle, sign out
- BottomNav shows user avatar for Profile tab
- `app/actions/profile.js` — `uploadAvatar`, `updateProfile` (syncs Prisma + Supabase auth metadata)

### Sprint 6: Polish + Edge Cases
- Error handling on login page (`?error=auth_failed`, `?error=confirmation_failed`)
- Better "Invalid login credentials" message
- Redirect to profile if already logged in (login + signup pages)
- `ensureUserExists` changed to `upsert` for reliability

---

## Phase 3 — Quiz Feature (COMPLETE)

### Sprint 1: Data Layer + Utilities
- `QuizResult` model in Prisma: mode, score, total, missed, testedWordIds, duration, userId
- `app/actions/quiz.js` — `saveQuizResult`, `getQuizHistory`, `getWordProgress`
- `lib/local-quiz.js` — IndexedDB storage for guest quiz results
- `lib/quiz-utils.js` — shuffle, generateOptions, fuzzyMatch (Levenshtein), generateMatchPairs, QUIZ_MODES

### Sprint 2: Quiz Page + Mode Selection
- Quiz page (`/quiz`) with auth/guest branching (same pattern as words page)
- `QuizPageContent.js` — state machine: mode_select → session → results
- `ModeSelect.js` — grid of 4 mode cards with word count selector (5/10/All)
- Modes requiring 4+ words disabled if insufficient, empty state if no words

### Sprint 3: Quiz Mode Components
- **Flashcard** — CSS 3D flip card (word → meaning), "Got it" / "Missed it" buttons
- **Multiple Choice** — 4 options (1 correct + 3 wrong), green/red feedback, auto-advance
- **Type Answer** — text input with fuzzy matching (Levenshtein, threshold 0.75), shows correct answer
- **Match Pairs** — two columns, tap word then meaning, 5 pairs, shake on wrong
- **QuizResults** — score %, duration, missed words list, "Try Again" / "All Modes" / "View Progress"

### Sprint 4: Progress Page
- Progress page (`/progress`) with auth/guest branching
- Per-word accuracy computed from `testedWordIds` + `missed` across all quiz results
- Color-coded: green (>=70%), yellow (40-69%), red (<40%), gray (untested)
- Overall accuracy card, tested/untested word sections with progress bars
- Linked from home page Progress button, quiz ModeSelect, and QuizResults

---

## Phase 4 — AI Integration (PLANNED)

### Sprint 1: AI-Assisted Word Entry
- "Suggest with AI" button on Add Word page
- Call Claude API to generate meaning, explanation, and example sentences
- Display AI suggestions as editable prefills in the form
- Loading states and error handling

### Sprint 2: AI Quiz Grading
- Replace/supplement fuzzy matching with AI-powered answer evaluation
- Accept synonyms, paraphrases, and contextually correct answers
- Show AI feedback on why an answer was accepted/rejected
- Fallback to fuzzy match if AI is unavailable

---

## Phase 5 — Advanced Features (PLANNED)

- Spaced repetition — prioritize quizzing words with low accuracy
- Word of the day (random from collection)
- Export vocabulary as CSV/PDF
- Import words from CSV
- Tag management page (rename, merge, delete tags)
- Dashboard with charts (words added over time, quiz performance trends)
- PWA setup (manifest.json, service worker) for installability
- Offline support improvements
- Quiz history page with past session details

---

## Current Data Model

```prisma
model User {
  id        String   @id // Supabase Auth UUID
  email     String   @unique
  name      String?
  avatarUrl String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  words       Word[]
  quizResults QuizResult[]
}

model Word {
  id           String   @id @default(cuid())
  word         String
  meaningEn    String
  meaningBn    String?
  partOfSpeech String?
  explanation  String?
  examples     String[]
  tags         String[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  userId       String?
  user         User?    @relation(...)
}

model QuizResult {
  id             String   @id @default(cuid())
  mode           String
  score          Int
  total          Int
  missed         String[]
  testedWordIds  String[]
  duration       Int?
  createdAt      DateTime @default(now())
  userId         String
  user           User     @relation(...)
}
```

---

## Key Architecture Decisions
- **Server/Client branching**: Server Components check auth → render auth Client Component or guest Client Component
- **Local-first for guests**: IndexedDB stores words + quiz results, migrated to DB on signup
- **Server Actions** over API routes — simpler, less boilerplate
- **Deploy early** — continuous deployment from day one via Vercel
- **AI is additive** — the app works fully without AI; AI enhances it
- **No language enum** — words are English vocabulary with English meaning (meaningEn) and optional Bengali meaning (meaningBn)
