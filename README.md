# Vocabularium

**Live site:** https://vocabularium.vercel.app/

A personal vocabulary builder. Add words you come across, let AI fill in meanings, part of speech, and example sentences, then practice with flashcards, multiple choice, type-answer, and match-pairs quizzes — or turn your saved words into an AI-generated story.

## Features

- **Add & organize words** — meanings (English + Bengali), part of speech, explanations, example sentences, and tags
- **AI Assist** — auto-fills word details via Google Gemini (Groq as a backup)
- **Playground** — four quiz modes with weighted practice based on your accuracy history
- **AI Story Generator** — turns a set of your words into a short story that naturally uses all of them
- **Progress tracking** — per-word accuracy and quiz history
- **Word sharing** — send a word to another user's inbox
- **Guest mode** — use the app fully offline with no account, stored locally on-device; sign up later to migrate everything to the cloud
- **Installable PWA** with light/dark/system theming

## Tech stack

- [Next.js](https://nextjs.org/) (App Router) + React
- [Prisma](https://www.prisma.io/) + PostgreSQL (via Supabase)
- [Supabase](https://supabase.com/) for auth
- Google Gemini / Groq for AI features
- Tailwind CSS

## Local development

```bash
npm install
npm run dev
```

Requires a `.env` with `DATABASE_URL`, `DIRECT_URL`, your Supabase project keys, and your Gemini/Groq API keys.
