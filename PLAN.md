# Vocabularium - Project Plan

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: Supabase Auth (for later phases)
- **AI**: Claude API (for meaning/example generation + quiz grading)
- **Deployment**: Vercel

---

## Phase 1 — MVP (Manual Vocabulary CRUD + Deploy)

### Sprint 1: Project Scaffolding + Deploy Pipeline (Day 1-2)
1. Initialize Next.js project with App Router, TypeScript, TailwindCSS
2. Set up shadcn/ui component library
3. Set up Supabase project, get connection string
4. Configure Prisma with the Supabase PostgreSQL
5. Design and create the Prisma schema:
   - `Word` model: id, word, language (BANGLA | ENGLISH), meaning, explanation, examples (string[]), tags (string[]), createdAt, updatedAt
6. Run initial migration
7. **Deploy to Vercel** — get a live URL early for sharing/testing
8. Set up environment variables on Vercel (DATABASE_URL, DIRECT_URL)

### Sprint 2: Add Word Flow (Day 3-5)
1. Build the "Add Word" page (`/add`)
   - Input for the word itself
   - Language toggle/selector: Bangla / English
   - Textarea for meaning
   - Textarea for explanation
   - Dynamic list for examples (add/remove example fields)
   - Tag input (comma-separated or chip-style)
   - Submit button
2. Create Server Action to save word to database
3. Add form validation (word & meaning required at minimum)
4. Toast notifications for success/error
5. Mobile-first responsive design — app-like feel

### Sprint 3: Word List & View (Day 6-9)
1. Build the "Words" page (`/words`) — card-based list view
2. Implement sorting options:
   - **Alphabetical** (A-Z, Z-A)
   - **Chronological** (newest first, oldest first)
   - **By Tag/Group** — grouped sections with tag headers
3. Filter by language (Bangla / English / All)
4. Search bar for quick word lookup
5. Individual word detail view (`/words/[id]`) — full details page
6. Edit word functionality
7. Delete word with confirmation

### Sprint 4: Mobile-First UI Polish (Day 10-11)
1. Bottom navigation bar (app-like): Home, Add, Words, Quiz
2. Smooth page transitions
3. Pull-to-refresh feel, loading skeletons
4. PWA setup (manifest.json, service worker) — installable on phone
5. Dark/light mode toggle
6. Typography tuning for Bangla font support

**Phase 1 Deliverable**: A fully functional, deployed web app where you can manually add, view, edit, delete words with tags and sorting. Shareable URL for feedback.

---

## Phase 2 — Quiz System (Manual Grading)

### Sprint 5: Basic Quiz (Day 12-15)
1. Quiz page (`/quiz`) with vertical split layout:
   - **Top half**: Shows the word (+ optional hint button)
   - **Bottom half**: Text input for answer
2. Quiz settings before start:
   - Choose language (quiz Bangla words, English words, or mixed)
   - Choose tags to filter (e.g., only quiz words from a specific book)
   - Number of words per session
3. Random word selection from the pool
4. Hint system — progressive hints:
   - Hint 1: First letter
   - Hint 2: Show explanation
   - Hint 3: Show one example
5. Answer submission with **exact match grading**
6. Result screen at end — score, list of correct/incorrect
7. Option to review wrong answers

### Sprint 6: Quiz Polish (Day 16-17)
1. Quiz progress bar
2. Streak counter / session stats
3. Animation on correct/incorrect answers
4. "Show answer" option if stuck
5. Quiz history page — track past sessions

**Phase 2 Deliverable**: Working quiz mode with exact matching, hints, and session results.

---

## Phase 3 — AI Integration

### Sprint 7: AI-Assisted Word Entry (Day 18-21)
1. Add "Suggest with AI" button on the Add Word page
2. User types the word + selects language → clicks suggest
3. Call Claude API to generate:
   - Meaning
   - Explanation
   - 3 example sentences
4. Display AI suggestions in the form fields (editable)
5. User can accept, edit, or discard each suggestion
6. Loading states and error handling for API calls
7. Rate limiting to control API costs

### Sprint 8: AI Quiz Grading (Day 22-24)
1. Replace exact matching with AI-powered grading
2. Send word + expected meaning + user answer to Claude API
3. Accept synonyms, paraphrases, close-enough answers
4. Return a score (correct / partially correct / incorrect) with feedback
5. Show AI explanation for why answer was accepted/rejected
6. Keep fallback to exact match if AI is unavailable

**Phase 3 Deliverable**: AI suggests word details and grades quiz answers intelligently.

---

## Phase 4 — Auth & Multi-User + Enhancements

### Sprint 9: Authentication (Day 25-27)
1. Supabase Auth integration (email/password, Google OAuth)
2. User model linked to words (each user has their own vocabulary)
3. Protected routes — redirect to login if unauthenticated
4. Profile page with stats (total words, words per language, quiz scores)

### Sprint 10: Advanced Features (Day 28-32)
1. Spaced repetition logic — prioritize quizzing words you get wrong
2. Word of the day (random from your collection)
3. Export vocabulary as CSV/PDF
4. Import words from CSV
5. Tag management page (rename, merge, delete tags)
6. Dashboard with charts — words added over time, quiz performance

### Sprint 11: Final Polish (Day 33-35)
1. Onboarding flow for new users
2. Empty states with helpful prompts
3. Offline support improvements (PWA caching)
4. Performance optimization (pagination, infinite scroll)
5. SEO and Open Graph meta for sharing

---

## Data Model (Prisma Schema Preview)

```prisma
model Word {
  id          String   @id @default(cuid())
  word        String
  language    Language
  meaning     String
  explanation String?
  examples    String[]
  tags        String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Language {
  BANGLA
  ENGLISH
}
```
*Auth fields (userId, relation to User) added in Phase 4.*

---

## Key Architecture Decisions
- **No auth in MVP** — ship fast, add auth later. Single-user initially.
- **Server Actions** over API routes where possible — simpler, less boilerplate.
- **shadcn/ui** — gives polished, accessible components without heavy bundle.
- **Deploy early (Sprint 1)** — continuous deployment from day one.
- **AI is additive** — the app works fully without AI; AI enhances it.
