# Vocabularium

A personal vocabulary learning app for storing English words with meanings, examples, and quiz modes. Built mobile-first for Bengali speakers learning English.

## Features

- **Add Words** — Save words with English meaning, Bengali meaning, part of speech, explanation, examples, and tags; duplicate words are automatically rejected
- **Dictionary Lookup** — Auto-fill English meaning, part of speech, explanation, and examples instantly from free dictionary APIs (freedictionaryapi.com, with dictionaryapi.dev as fallback); no AI involved
- **AI Assist** — Auto-fill word details with one click using Google Gemini (Groq as automatic fallback); can be combined with Dictionary Lookup — results merge instead of overwriting, with Dictionary Lookup's part of speech taking priority
- **Browse & Search** — View all words with sorting and full-text search
- **Edit & Delete** — Manage your vocabulary from the word detail page
- **4 Quiz Modes** — Flashcard, Multiple Choice, Type Answer (AI-graded), Match Pairs; word pool can be filtered by tag or starting letter before each session
- **Weighted Quiz Randomization** — Words are selected based on quiz history; untested and frequently missed words are prioritized
- **AI Story Generator** — Pick 10/20/50/100 words (via search, random, letters, or tags) and generate a short AI-crafted story using them, with a paginated, deletable history
- **Progress Tracking** — Quiz history and per-word miss statistics
- **Word Pronunciation** — Tap the speaker icon next to any word title to hear it spoken aloud (Web Speech API, en-US)
- **Export Words** — Export your vocabulary as CSV or PDF from the word list; filter by all words, tags, or starting letters; always sorted A–Z
- **Word Sharing** — Share words with other users by email; accept or dismiss from inbox
- **Friends** — Add friends by email, view friend list with search and pagination, send/accept/decline friend requests, share words directly from a friend card, remove friends
- **Learning Tracker** — Track learning progress by letter or tag; tap to cycle through Not Started → Learning → Learned; auto-resets when new words are added to a letter or tag
- **Guest Mode** — Full functionality without an account (stored in IndexedDB); migrates to account on signup
- **Dark/Light Mode** — System-aware theme with manual toggle
- **Bangla Support** — Noto Sans Bengali font for proper rendering

## Tech Stack

- **Next.js 16** (App Router) + **React 19**
- **TailwindCSS 4**
- **Prisma 6** + **PostgreSQL** (Supabase)
- **Supabase Auth** (email/password + Google OAuth)
- **Google Gemini API** (`gemini-3.5-flash`) — primary AI provider for AI Assist, quiz grading, and the Story Generator
- **Groq API** (`openai/gpt-oss-120b`) — automatic fallback if Gemini errors or is unavailable
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
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev
```

## Upcoming Features

- [x] Word pronunciation via Web Speech API (speaker icon beside word title) [WordDetailPage]
- [x] Export words as CSV/PDF with dynamic range (All / By Tags / By Letters) [WordListPage]
- [x] Learning tracker by Letters and Tags with auto-reconciliation. [ProfilePage → /learning-tracker]
- [x] Friends — add by email, requests page, share words from friend card, remove friend. [ProfilePage → /friends]
- [x] AI Story Generator — generate short stories from selected vocabulary words with a paginated, deletable history. [QuizPage → /story-generator]
- [x] Dictionary Lookup — free-dictionary-API auto-fill button alongside AI Assist under Auto Fill; results merge instead of overwriting. [AddWordPage]
- [x] Switched primary AI provider to Google Gemini (`gemini-3.5-flash`) with Groq (`openai/gpt-oss-120b`) as an automatic fallback — Groq deprecated the previously used models. [assist.js, quiz.js, story.js]
