# Vocabularium

A personal vocabulary builder web app for storing English words with meanings, examples, and tags. Built as a mobile-first PWA.

## Features

- **Add Words** — Save words with English meaning, Bangla meaning, part of speech, explanation, examples, and tags
- **Browse & Search** — View all words with sorting (A-Z, newest, by tag) and full-text search
- **Edit & Delete** — Manage your vocabulary from the word detail page
- **Dark/Light Mode** — System-aware theme with manual toggle
- **PWA** — Installable on mobile, works like a native app
- **Bangla Support** — Noto Sans Bengali font for proper rendering

## Tech Stack

- **Next.js 16** (App Router)
- **TailwindCSS 4**
- **Prisma 6** + **PostgreSQL** (Supabase)
- **Vercel** (deployment)

## Setup

```bash
npm install
```

Create a `.env` file:

```
DATABASE_URL=postgresql://...pooler...supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...supabase.com:5432/postgres
```

Run migrations and start:

```bash
npx prisma migrate dev
npm run dev
```

## Roadmap

- [ ] Quiz mode with hints and scoring
- [ ] AI-powered meaning suggestions (Claude API)
- [ ] AI quiz grading (synonym acceptance)
- [ ] User authentication
- [ ] Spaced repetition
- [ ] Import/export (CSV)
