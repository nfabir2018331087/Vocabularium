# Flutter Migration Prompt for Vocabularium

Copy everything below the line and paste it as your first message to Claude Code when you open the `Vocabularium-Flutter` project folder.

---

## PROMPT START

I'm migrating my vocabulary learning app from Next.js to Flutter. The original project is at `d:/Personal/Vocabularium/` — you can read any file from there for reference. This Flutter app is **fully offline-first** with all data stored locally on-device using SQLite. There is NO backend server. The only cloud feature is an optional **Google Drive backup/sync** via the user's Google account.

### What the app does

**Vocabularium** is a vocabulary learning app for Bengali speakers learning English. Users can:
- Add words with: word, English meaning, Bengali meaning, part of speech, explanation, examples[], tags[]
- Browse/search/filter/sort their word list
- Take quizzes in 4 modes: Flashcard, Multiple Choice, Type Answer (AI-graded), Match Pairs
- Track quiz progress and per-word miss statistics
- Use a learning tracker (by alphabet letter or tag, with 3-state cycle: Not Started → Learning → Learned)
- Export words as CSV or PDF
- Hear word pronunciation (TTS)
- Dark/light theme with system-aware default
- **Google Drive sync:** A "Sync" button in profile — signs in with Google, backs up the entire local DB to Google Drive's appDataFolder. Can restore from backup on a new device.

### Architecture: Fully Local + Google Drive Backup

```
┌─────────────────────────────────┐
│         Flutter App             │
│                                 │
│  ┌───────────┐  ┌────────────┐  │
│  │  sqflite   │  │  Riverpod  │  │
│  │  (SQLite)  │  │  (State)   │  │
│  └─────┬─────┘  └────────────┘  │
│        │                        │
│  ┌─────▼─────────────────────┐  │
│  │  All data lives locally   │  │
│  │  Words, Quiz Results,     │  │
│  │  Tracker, Settings        │  │
│  └─────┬─────────────────────┘  │
│        │ (optional sync)        │
│  ┌─────▼─────────────────────┐  │
│  │  Google Drive appDataFolder│  │
│  │  (backup/restore as JSON) │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**No Supabase. No backend. No auth required to use the app.** The app works immediately after install — all data is local SQLite. Google sign-in is ONLY for the optional backup/sync feature.

### Local Database Schema (SQLite via sqflite)

```sql
CREATE TABLE words (
  id TEXT PRIMARY KEY,          -- CUID generated client-side
  word TEXT NOT NULL,
  meaning_en TEXT NOT NULL,
  meaning_bn TEXT,
  part_of_speech TEXT,
  explanation TEXT,
  examples TEXT,                -- JSON array stored as TEXT: '["example 1","example 2"]'
  tags TEXT,                    -- JSON array stored as TEXT: '["tag1","tag2"]'
  created_at TEXT NOT NULL,     -- ISO 8601 datetime string
  updated_at TEXT NOT NULL
);

CREATE TABLE quiz_results (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL,           -- "flashcard", "multiple-choice", "type-answer", "match-pairs"
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  missed TEXT,                  -- JSON array of word IDs: '["id1","id2"]'
  tested_word_ids TEXT,         -- JSON array of word IDs
  duration INTEGER,             -- seconds
  created_at TEXT NOT NULL
);

CREATE TABLE tracker_data (
  key TEXT PRIMARY KEY,         -- letter like "A","B" or tag name
  status TEXT NOT NULL,         -- "not_started", "learning", "learned"
  type TEXT NOT NULL,           -- "letter" or "tag"
  updated_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- Settings keys: "theme" ("light"/"dark"/"system"), "user_name", "avatar_path", "google_email", "last_sync_at"

CREATE INDEX idx_words_created ON words(created_at);
CREATE INDEX idx_words_word ON words(word COLLATE NOCASE);
CREATE INDEX idx_quiz_results_created ON quiz_results(created_at);
CREATE INDEX idx_tracker_type ON tracker_data(type);
```

**Note:** SQLite doesn't have array types, so `examples`, `tags`, `missed`, `tested_word_ids` are stored as JSON strings. The Dart model classes handle serialization/deserialization.

### Google Drive Sync Feature

**How it works:**
1. User taps "Sync to Google Drive" button in Profile screen
2. App triggers Google Sign-In (using `google_sign_in` package) requesting `drive.appdata` scope
3. On first sync: serialize entire DB (all tables) to a single JSON file → upload to Google Drive's `appDataFolder` (hidden, app-private folder that users can't see/edit)
4. On subsequent syncs: download existing backup → merge with local data (newer wins by `updated_at` / `created_at`) → upload merged result
5. Show last sync timestamp in profile

**Backup JSON format:**
```json
{
  "version": 1,
  "exported_at": "2026-05-21T10:30:00Z",
  "words": [...],
  "quiz_results": [...],
  "tracker_data": [...],
  "settings": {...}
}
```

**Packages for Google Drive sync:**
- `google_sign_in` — Google account authentication
- `googleapis: ^13.0.0` — Google Drive API v3
- `http` — HTTP client for googleapis

**Merge strategy:** When syncing, for each record:
- If exists only locally → add to backup
- If exists only in backup → add to local DB
- If exists in both → keep the one with newer `updated_at` (or `created_at` for quiz_results which are immutable)
- Deleted records: track deletions in a `deleted_ids` table so they propagate across devices

```sql
CREATE TABLE deleted_ids (
  id TEXT PRIMARY KEY,          -- The ID of the deleted record
  table_name TEXT NOT NULL,     -- "words", "quiz_results", "tracker_data"
  deleted_at TEXT NOT NULL
);
```

### Tech stack

- **State management:** Riverpod (flutter_riverpod)
- **Navigation:** GoRouter
- **Local DB:** sqflite (SQLite)
- **Google auth:** google_sign_in (ONLY for Drive backup, not for app access)
- **Google Drive:** googleapis (Drive API v3)
- **TTS:** flutter_tts
- **Font:** google_fonts (Noto Sans Bengali for Bangla text)
- **Theme:** Material 3 with dark/light mode, primary color indigo (#6366F1)
- **AI Assist:** Call Groq API directly. API key: `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`, model: `llama-3.3-70b-versatile`
- **Export:** csv + pdf packages
- **ID generation:** uuid or a cuid package for generating unique IDs

### Project structure

```
lib/
├── main.dart                       # App entry, DB init, runApp
├── app.dart                        # MaterialApp.router + ProviderScope
├── config/
│   └── constants.dart              # Groq API key, app constants
├── models/
│   ├── word.dart                   # Word model with fromMap/toMap (SQLite-friendly)
│   ├── quiz_result.dart
│   ├── tracker_entry.dart
│   └── backup_data.dart            # Full backup model for Google Drive JSON
├── providers/
│   ├── words_provider.dart         # CRUD, search, filter, sort
│   ├── quiz_provider.dart          # Quiz state, save results, progress stats
│   ├── theme_provider.dart         # Dark/light/system, persisted in settings table
│   ├── tracker_provider.dart       # Learning tracker state
│   └── sync_provider.dart          # Google sign-in state, sync status, last sync time
├── services/
│   ├── database_service.dart       # sqflite: init DB, all CRUD operations, migrations
│   ├── google_drive_service.dart   # Google Sign-In + Drive API backup/restore
│   ├── ai_assist_service.dart      # Groq API calls for word assist + quiz grading
│   └── tts_service.dart            # flutter_tts wrapper
├── screens/
│   ├── home/
│   │   └── home_screen.dart        # Dashboard: word count, recent words, quick actions
│   ├── words/
│   │   ├── word_list_screen.dart   # Search, sort, filter by tag/letter, export
│   │   ├── word_detail_screen.dart # Full details + TTS + edit/delete buttons
│   │   ├── add_word_screen.dart    # Word form + AI assist button
│   │   └── edit_word_screen.dart
│   ├── quiz/
│   │   ├── quiz_setup_screen.dart  # Mode selection + word filter (by tag or letter)
│   │   ├── flashcard_quiz_screen.dart
│   │   ├── multiple_choice_quiz_screen.dart
│   │   ├── type_answer_quiz_screen.dart
│   │   └── match_pairs_quiz_screen.dart
│   ├── progress/
│   │   └── progress_screen.dart    # Quiz history list + per-word miss stats
│   ├── profile/
│   │   ├── profile_screen.dart     # Name, theme toggle, Google sync button, export, about
│   │   └── user_manual_screen.dart
│   └── learning_tracker/
│       └── tracker_screen.dart     # A-Z grid or tag list, 3-state toggle per item
├── widgets/
│   ├── bottom_nav_bar.dart         # 4-tab bottom nav (Home, Words, Quiz, Profile)
│   ├── word_form_widget.dart       # Reusable word input form (used by add & edit)
│   ├── loading_skeleton.dart       # Shimmer loading placeholder
│   └── tag_chip.dart               # Tag display chip
├── router/
│   └── app_router.dart             # GoRouter config (no auth guards needed)
└── utils/
    ├── quiz_utils.dart             # Weighted random sampling, fuzzy string match
    ├── theme.dart                  # Light & dark ThemeData definitions
    ├── id_generator.dart           # CUID or UUID generator
    └── date_utils.dart             # ISO 8601 helpers
```

### Screens & navigation

**Bottom navigation (4 tabs):** Home, Words, Quiz, Profile

Since there's no auth/social features, navigation is simpler:

**Routes:**
- `/` → Home (dashboard with word count, recent words, quick actions)
- `/add` → Add word
- `/words` → Word list (search, sort, filter, export)
- `/words/:id` → Word detail
- `/words/:id/edit` → Edit word
- `/quiz` → Quiz setup (mode selection + word filter)
- `/quiz/:mode` → Active quiz
- `/progress` → Quiz history & per-word stats
- `/profile` → Profile (name, theme, Google sync, export, manual)
- `/profile/manual` → User manual / help
- `/learning-tracker` → Learning tracker

No login/signup/friends/inbox screens needed. The app launches straight to Home.

### Key behaviors to replicate from the original app

1. **AI Assist (Add Word page):** User types a word → taps "AI Assist" → calls Groq API with prompt asking for meaningEn, meaningBn, partOfSpeech, explanation, examples, tags → auto-fills the form. Reference: `d:/Personal/Vocabularium/app/actions/assist.js`

2. **Quiz weighted randomization:** Words that have never been tested get highest priority. Words that are frequently missed get next priority. Recently tested words get lowest priority. Reference: `d:/Personal/Vocabularium/lib/quiz-utils.js`

3. **Type Answer quiz AI grading:** After user types answer, send to Groq with the word + correct meaning + user answer → Groq returns {correct: bool, feedback: string}. Also do client-side fuzzy matching as fallback. Reference: `d:/Personal/Vocabularium/app/actions/quiz.js`

4. **Learning tracker:** User sees all 26 letters (A-Z) or their tags. Each has a 3-state cycle: Not Started (gray) → Learning (yellow) → Learned (green). Auto-reconcile: if tracker shows "A" but there are no words starting with "A", update accordingly. Reference: `d:/Personal/Vocabularium/app/learning-tracker/page.js`

5. **Export:** Words can be exported as CSV or PDF with current filters applied. Reference: `d:/Personal/Vocabularium/app/words/page.js`

6. **Theme:** Material 3, primary indigo (#6366F1), with dark mode. Persist preference in SQLite settings table. System-aware default.

7. **Duplicate detection:** When adding a word, check if the same word (case-insensitive) already exists. Show warning if duplicate found.

8. **Google Drive sync:** Profile screen shows a "Sync to Google Drive" button. If not signed in → trigger Google Sign-In with `drive.appdata` scope. If signed in → show Google email, last sync time, and sync/disconnect buttons. Sync merges local + cloud data (newer wins). Reference the merge strategy described above.

9. **Word pronunciation:** TTS button on word detail screen using flutter_tts, language en-US.

10. **Search & filter:** Word list supports: text search (searches word + meaningEn + meaningBn), filter by tag, filter by starting letter, sort by date/alphabetical (asc/desc).

### Implementation order (suggested phases)

**Phase 1 — Foundation:**
- Project setup, add all dependencies to pubspec.yaml
- Database service (sqflite init, create tables, CRUD methods for all tables)
- Models (Word, QuizResult, TrackerEntry, BackupData) with fromMap/toMap
- Theme (light + dark ThemeData)
- GoRouter setup
- Bottom navigation shell
- Basic home screen (placeholder)

**Phase 2 — Core word features:**
- Add word screen + word form widget
- Word list screen (search, sort, filter by tag/letter)
- Word detail screen (with TTS pronunciation)
- Edit word screen
- AI Assist integration (Groq API service)
- Duplicate detection
- Export (CSV + PDF)

**Phase 3 — Quiz system:**
- Quiz setup screen (mode selection + word filter)
- Flashcard quiz
- Multiple choice quiz
- Type answer quiz (with AI grading + fuzzy match fallback)
- Match pairs quiz
- Save quiz results to SQLite

**Phase 4 — Progress & tracking:**
- Progress screen (quiz history list + per-word miss statistics)
- Learning tracker screen (A-Z grid + tag list, 3-state toggle)
- Auto-reconciliation logic

**Phase 5 — Profile & Google Drive sync:**
- Profile screen (name, avatar, theme toggle)
- Google Sign-In integration
- Google Drive backup service (upload/download/merge)
- Sync UI (button, status, last sync time, disconnect)

**Phase 6 — Polish:**
- Loading skeletons / shimmer animations
- Empty states for all screens
- Error handling and snackbar notifications
- App icon and splash screen
- User manual screen

### Reference files to read from original project

For exact feature behavior, read these files from `d:/Personal/Vocabularium/`:
- `app/actions/words.js` — word CRUD logic
- `app/actions/quiz.js` — quiz save & progress queries
- `app/actions/assist.js` — Groq AI assist prompt (exact prompt text to reuse)
- `app/actions/tracker.js` — tracker save/load
- `app/quiz/modes/FlashcardQuiz.js` — flashcard quiz UI & logic
- `app/quiz/modes/MultipleChoiceQuiz.js` — multiple choice quiz UI & logic
- `app/quiz/modes/TypeAnswerQuiz.js` — type answer quiz UI & logic
- `app/quiz/modes/MatchPairsQuiz.js` — match pairs quiz UI & logic
- `lib/quiz-utils.js` — weighted randomization algorithm
- `app/components/WordForm.js` — the word input form
- `app/globals.css` — theme colors & animations (for color reference)
- `app/words/page.js` — word list with search/filter/sort/export
- `app/learning-tracker/page.js` — learning tracker UI & logic

Start with Phase 1. Set up the project structure, add all dependencies to pubspec.yaml, create the database service with all tables, models, theme, router, and bottom nav shell. Ask me before proceeding to each new phase.

## PROMPT END
