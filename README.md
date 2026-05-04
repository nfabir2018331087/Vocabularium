# Vocabularium

A personal vocabulary learning app for storing English words with meanings, examples, and quiz modes. Built mobile-first for Bengali speakers learning English.

## Features

- **Add Words** — Save words with English meaning, Bengali meaning, part of speech, explanation, examples, and tags; duplicate words are automatically rejected
- **AI Assist** — Auto-fill word details with one click using Groq AI
- **Browse & Search** — View all words with sorting and full-text search
- **Edit & Delete** — Manage your vocabulary from the word detail page
- **4 Quiz Modes** — Flashcard, Multiple Choice, Type Answer (AI-graded), Match Pairs; word pool can be filtered by tag or starting letter before each session
- **Weighted Quiz Randomization** — Words are selected based on quiz history; untested and frequently missed words are prioritized
- **Progress Tracking** — Quiz history and per-word miss statistics
- **Word Pronunciation** — Tap the speaker icon next to any word title to hear it spoken aloud (Web Speech API, en-US)
- **Export Words** — Export your vocabulary as CSV or PDF from the word list; filter by all words, tags, or starting letters; always sorted A–Z
- **Word Sharing** — Share words with other users by email; accept or dismiss from inbox
- **Guest Mode** — Full functionality without an account (stored in IndexedDB); migrates to account on signup
- **Dark/Light Mode** — System-aware theme with manual toggle
- **Bangla Support** — Noto Sans Bengali font for proper rendering

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TailwindCSS 4**
- **Prisma 6** + **PostgreSQL** (Supabase)
- **Supabase Auth** (email/password + Google OAuth)
- **Groq API** (`llama-3.3-70b-versatile`) for AI assist and quiz grading
- **Vercel** (deployment)

## Setup

```bash
npm install
```

Create a `.env` file:

```
DATABASE_URL=postgresql://...pooler...supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev
```

## Upcoming Features

- [x] Word pronunciation via Web Speech API (speaker icon beside word title) [WordDetailPage]
- [x] Export words as CSV/PDF with dynamic range (All / By Tags / By Letters) [WordListPage]
- [ ] Reading tracker. [ProfilePage]
- [ ] Friends (Add, List). [ProfilePage]
