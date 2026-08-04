"use client";

import { useState, useEffect } from "react";

const sections = [
  {
    id: "guest",
    label: "Guest",
    emoji: "👤",
    color: "amber",
    intro: "No account needed. Jump right in — everything is stored locally on your device.",
    features: [
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        ),
        title: "Add Words",
        color: "blue",
        steps: [
          'Tap the + button in the bottom navigation.',
          'Fill in the word, English meaning, and optionally: Bengali meaning, part of speech, explanation, example sentences, and tags.',
          'Tap Save. The word is stored on your device.',
        ],
        note: "AI Assist is not available in guest mode. You fill in everything manually.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
          </svg>
        ),
        title: "Browse Your Words",
        color: "purple",
        steps: [
          'Tap Words in the bottom nav to see your full word list.',
          'Sort by A–Z, newest first, or by tag using the sort button.',
          'Use the search bar to find a specific word instantly.',
          'Tap any word to see its full details.',
        ],
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        ),
        title: "Export Words",
        color: "orange",
        steps: [
          'Go to the Words page.',
          'Tap the Export button (↗) next to the word count.',
          'Choose CSV or PDF from the dropdown.',
          'Select your word pool: All Words, By Tags, or By Letters.',
          'Tap Export — the file downloads immediately (CSV) or opens a print dialog (PDF).',
        ],
        note: "Exported columns: Word, Meaning (En), Meaning (Bn), Explanation, Examples. Words are always sorted A–Z in the export.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 010 7.07" />
            <path d="M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        ),
        title: "Pronounce a Word",
        color: "teal",
        steps: [
          'Open any word from your list.',
          'Tap the speaker icon next to the word title.',
          'The word is read aloud in English (en-US).',
          'Tap again to stop.',
        ],
        note: "Uses your browser's built-in text-to-speech. Works offline with no data usage.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        title: "Quiz Yourself",
        color: "green",
        steps: [
          'Tap Quiz in the bottom nav.',
          'Choose a mode — each has a minimum word requirement:',
        ],
        modes: [
          { name: "Flashcard", min: "1+ words", desc: "Tap to flip between word and meaning." },
          { name: "Multiple Choice", min: "4+ words", desc: "Pick the correct meaning from 4 options." },
          { name: "Type Answer", min: "1+ word", desc: "Type the meaning from memory. Your answer is checked with fuzzy matching." },
          { name: "Match Pairs", min: "4+ words", desc: "Connect each word to its meaning by tapping." },
        ],
        note: "Type Answer uses fuzzy matching locally in guest mode — no AI grading.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        ),
        title: "Track Progress",
        color: "orange",
        steps: [
          'Tap Progress in the bottom nav.',
          'See your quiz history, total words tested, and which words you missed most.',
          'Use this to focus your study on weak words.',
        ],
        note: "Progress is stored locally. Clearing browser data will erase it.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        ),
        title: "Sign Up to Save Your Data",
        color: "red",
        steps: [
          'Go to Profile → Sign Up.',
          'All your locally stored words will automatically migrate to your new account.',
          'After signing up, your words are safe in the cloud.',
        ],
      },
    ],
    limits: [
      "Words stored only on this device",
      "No AI Assist",
      "No AI Story Generator",
      "No Word Sharing",
      "No cross-device sync",
    ],
  },
  {
    id: "auth",
    label: "Account",
    emoji: "✨",
    color: "primary",
    intro: "Unlock everything. Your words are in the cloud, AI fills in details, and you can share words with friends.",
    features: [
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
        title: "AI Assist",
        color: "yellow",
        steps: [
          'Tap + to open the Add Word form.',
          'Type just the word, then tap the AI Assist button (⚡).',
          'The AI auto-fills: English meaning, Bengali meaning, part of speech, explanation, example sentences, and tags.',
          'Review and edit anything before saving.',
        ],
        note: "Powered by Groq (llama-3.1-8b-instant). Results are fast and usually accurate.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        ),
        title: "Add & Edit Words",
        color: "blue",
        steps: [
          'Tap + to add a word. Use AI Assist or fill in manually.',
          'Tap any word in your list → tap Edit to change it.',
          'Tap Delete on the word detail page to remove it.',
          'Words sync to your account immediately.',
        ],
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        ),
        title: "Export Words",
        color: "orange",
        steps: [
          'Go to the Words page.',
          'Tap the Export button (↗) next to the word count.',
          'Choose CSV or PDF from the dropdown.',
          'Select your word pool: All Words, By Tags, or By Letters.',
          'Tap Export — the file downloads immediately (CSV) or opens a print dialog (PDF).',
        ],
        note: "Exported columns: Word, Meaning (En), Meaning (Bn), Explanation, Examples. Words are always sorted A–Z in the export.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 010 7.07" />
            <path d="M19.07 4.93a10 10 0 010 14.14" />
          </svg>
        ),
        title: "Pronounce a Word",
        color: "teal",
        steps: [
          'Open any word from your list.',
          'Tap the speaker icon next to the word title.',
          'The word is read aloud in English (en-US).',
          'Tap again to stop.',
        ],
        note: "Uses your browser's built-in text-to-speech. Works offline with no data usage.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        ),
        title: "Share Words",
        color: "pink",
        steps: [
          'Open a word detail page and tap the Share button.',
          'Enter the recipient\'s email address (they must have an account).',
          'The word lands in their Inbox.',
          'They can Accept (adds to their library) or Remove it.',
          'You can see words you\'ve sent from the same word detail page.',
        ],
        note: "Shared words are copies — editing the original does not affect the shared version.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        ),
        title: "Inbox",
        color: "purple",
        steps: [
          'Tap the inbox icon on the Home page (shows a badge if you have new words).',
          'New words from others appear here.',
          'Tap Accept to copy a word into your personal library.',
          'Tap Remove to dismiss it without saving.',
          'Words are marked as read automatically when you open the inbox.',
        ],
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        title: "Quiz Modes",
        color: "green",
        steps: [
          'All 4 quiz modes available — same as guest.',
          'Type Answer is AI-graded: synonyms and close answers are accepted.',
          'Quiz results are saved to your account and visible in Progress.',
        ],
        modes: [
          { name: "Flashcard", min: "1+ words", desc: "Flip to reveal meaning." },
          { name: "Multiple Choice", min: "4+ words", desc: "4 options, pick the right one." },
          { name: "Type Answer", min: "1+ word", desc: "AI-graded — synonyms accepted." },
          { name: "Match Pairs", min: "4+ words", desc: "Drag or tap to match words to meanings." },
        ],
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="9" y1="7" x2="15" y2="7" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
        ),
        title: "AI Story Generator",
        color: "red",
        steps: [
          'Tap Quiz in the bottom nav, then tap the Story Generator tile.',
          'Choose how many words to use — 10, 20, 50, or 100.',
          'Fill your selection using Search, Random, Letters, or Tags — you can mix and match until you hit your target.',
          'Tap Generate Story. The AI writes a short story that naturally uses every selected word, bolded in the text.',
          'Tap View all next to a story\'s word count to see its full word list in a scrollable grid.',
          'Tap the trash icon on a story to delete it.',
        ],
        note: "Powered by Groq. Great for seeing your vocabulary used in context — stories aren't graded and don't affect your quiz progress.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        ),
        title: "Profile",
        color: "orange",
        steps: [
          'Tap your avatar to upload a new profile photo.',
          'Tap your name to edit it inline.',
          'Toggle between Light, Dark, and System themes.',
          'Sign Out from the bottom of the page.',
        ],
      },
    ],
  },
];

const colorMap = {
  blue:    { bg: "bg-blue-500/10",   icon: "text-blue-500",   border: "border-blue-500/20"   },
  purple:  { bg: "bg-purple-500/10", icon: "text-purple-500", border: "border-purple-500/20" },
  green:   { bg: "bg-emerald-500/10",icon: "text-emerald-500",border: "border-emerald-500/20"},
  orange:  { bg: "bg-orange-500/10", icon: "text-orange-500", border: "border-orange-500/20" },
  red:     { bg: "bg-red-500/10",    icon: "text-red-500",    border: "border-red-500/20"    },
  yellow:  { bg: "bg-yellow-500/10", icon: "text-yellow-500", border: "border-yellow-500/20" },
  pink:    { bg: "bg-pink-500/10",   icon: "text-pink-500",   border: "border-pink-500/20"   },
  teal:    { bg: "bg-teal-500/10",   icon: "text-teal-500",   border: "border-teal-500/20"   },
};

function FeatureCard({ feature }) {
  const [open, setOpen] = useState(false);
  const c = colorMap[feature.color] ?? colorMap.blue;

  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className={`shrink-0 ${c.icon}`}>{feature.icon}</span>
        <span className="flex-1 text-sm font-semibold text-text">{feature.title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <ol className="flex flex-col gap-1.5">
            {feature.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-xs text-text-secondary">
                <span className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${c.bg} ${c.icon}`}>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {feature.modes && (
            <div className="flex flex-col gap-1.5 mt-1">
              {feature.modes.map((m) => (
                <div key={m.name} className="flex items-start gap-2 text-xs">
                  <span className={`font-semibold shrink-0 ${c.icon}`}>{m.name}</span>
                  <span className="text-text-secondary/60">({m.min})</span>
                  <span className="text-text-secondary">— {m.desc}</span>
                </div>
              ))}
            </div>
          )}

          {feature.note && (
            <p className="text-xs text-text-secondary/70 italic border-l-2 border-current/20 pl-2">
              {feature.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserManual({ onClose }) {
  const [tab, setTab] = useState("guest");
  const active = sections.find((s) => s.id === tab);

  // Close on back gesture / Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative mt-auto w-full max-h-[92dvh] flex flex-col rounded-t-3xl bg-surface shadow-2xl animate-slide-up overflow-hidden">

        {/* Header */}
        <div className="hero-gradient px-6 pt-6 pb-5 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Vocabularium</p>
              <h2 className="text-xl font-bold text-white">User Manual</h2>
              <p className="text-sm text-white/70 mt-1">Everything you need to know</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                  tab === s.id
                    ? "bg-white text-primary shadow"
                    : "bg-white/15 text-white/80 hover:bg-white/25"
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 flex flex-col gap-4">
          {/* Intro */}
          <div className="p-4 rounded-2xl bg-surface-alt border border-border">
            <p className="text-sm text-text-secondary leading-relaxed">{active.intro}</p>
          </div>

          {/* Feature cards */}
          {active.features.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}

          {/* Limits (guest only) */}
          {active.limits && (
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
              <p className="text-xs font-semibold text-red-500 mb-2 uppercase tracking-wide">Guest Limitations</p>
              <ul className="flex flex-col gap-1.5">
                {active.limits.map((l) => (
                  <li key={l} className="flex items-center gap-2 text-xs text-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-red-400 shrink-0">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom padding for safe area */}
          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
