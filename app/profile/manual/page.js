"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const sections = [
  {
    id: "guest",
    label: "Guest",
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
        note: "AI Assist is not available in guest mode. You fill in everything manually. The app will warn you if you try to save a word that already exists in your library.",
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
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        title: "Quiz Yourself",
        color: "green",
        steps: [
          'Tap Quiz in the bottom nav.',
          'Tap a mode card to open the quiz configuration panel.',
          'Choose your Word Pool: Random (default), By Tags, or By Letters.',
          'By Tags: select one or more tags — only words with those tags are included.',
          'By Letters: tap one or more letters — only words starting with those letters are included.',
          'If the filtered pool has more words than the quiz size, the app picks randomly from it. If fewer, it uses all of them.',
          'Select the quiz size (if more than one option is available), then tap Start Quiz.',
          'You can skip any question during a quiz — skipped questions count as missed.',
        ],
        modes: [
          { name: "Flashcard", min: "1+ words", desc: "Tap to flip between word and meaning." },
          { name: "Multiple Choice", min: "4+ words", desc: "Pick the correct meaning from 4 options." },
          { name: "Type Answer", min: "1+ word", desc: "Type the meaning from memory. Fuzzy matching accepts close answers." },
          { name: "Match Pairs", min: "4+ words", desc: "Connect each word to its meaning by tapping." },
        ],
        note: "Type Answer uses local fuzzy matching in guest mode — no AI grading.",
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
        title: "Create an Account",
        color: "primary",
        steps: [
          'Go to Profile → Sign Up.',
          'All your locally stored words will automatically migrate to your new account.',
          'After signing up, your words are safe in the cloud.',
        ],
      },
    ],
    limits: [
      "Words stored only on this device — lost if you clear browser data",
      "No AI Assist for auto-filling word details",
      "No Word Sharing with other users",
      "No cross-device sync",
    ],
  },
  {
    id: "auth",
    label: "Account",
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
        note: "Powered by Groq (llama-3.3-70b-versatile). Results are fast and usually accurate.",
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
          'The app prevents duplicates — if the word already exists in your library, you will see a warning and the save will be blocked.',
          'Tap any word in your list → tap Edit to change it.',
          'The Update Word button only becomes active once you make a change — unchanged forms cannot be submitted.',
          'Tap Delete on the word detail page to remove it.',
          'Words sync to your account immediately.',
        ],
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
          "Enter the recipient's email address (they must have an account).",
          'The word lands in their Inbox.',
          'They can Accept it (adds to their library) or Remove it.',
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
          'Tap the inbox icon on the Home page (shows a badge when you have new words).',
          'Words shared by others appear here.',
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
          'Tap a mode card to open the quiz configuration panel.',
          'Choose your Word Pool: Random, By Tags, or By Letters.',
          'Random uses weighted selection — words you\'ve tested less often and words you struggle with are picked more frequently.',
          'By Tags: select one or more tags — only words carrying those tags enter the pool.',
          'By Letters: tap one or more A–Z letters — only words starting with those letters enter the pool.',
          'If the filtered pool exceeds the chosen quiz size, weighted randomization picks from it. If it\'s smaller, all words are used.',
          'Select your quiz size, then tap Start Quiz.',
          'Type Answer is AI-graded: synonyms and close answers are accepted.',
          'You can skip any question — skipped questions count as missed.',
          'Quiz results are saved to your account and visible in Progress.',
        ],
        modes: [
          { name: "Flashcard", min: "1+ words", desc: "Flip to reveal meaning." },
          { name: "Multiple Choice", min: "4+ words", desc: "4 options, pick the right one." },
          { name: "Type Answer", min: "1+ word", desc: "AI-graded — synonyms accepted." },
          { name: "Match Pairs", min: "4+ words", desc: "Tap to match words to meanings." },
        ],
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
  blue:    { bg: "bg-blue-500/10",    icon: "text-blue-500",    border: "border-blue-500/20"    },
  purple:  { bg: "bg-purple-500/10",  icon: "text-purple-500",  border: "border-purple-500/20"  },
  green:   { bg: "bg-emerald-500/10", icon: "text-emerald-500", border: "border-emerald-500/20" },
  orange:  { bg: "bg-orange-500/10",  icon: "text-orange-500",  border: "border-orange-500/20"  },
  primary: { bg: "bg-primary/10",     icon: "text-primary",     border: "border-primary/20"     },
  yellow:  { bg: "bg-yellow-500/10",  icon: "text-yellow-500",  border: "border-yellow-500/20"  },
  pink:    { bg: "bg-pink-500/10",    icon: "text-pink-500",    border: "border-pink-500/20"    },
};

function FeatureCard({ feature }) {
  const [open, setOpen] = useState(false);
  const c = colorMap[feature.color] ?? colorMap.blue;

  return (
    <div className={`rounded-2xl border ${c.border} overflow-hidden`}>
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
          className={`w-4 h-4 text-text-secondary shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className={`px-4 pb-4 flex flex-col gap-3 border-t ${c.border}`}>
          <ol className="flex flex-col gap-2 pt-3">
            {feature.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-text-secondary">
                <span className={`shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${c.bg} ${c.icon}`}>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          {feature.modes && (
            <div className="flex flex-col gap-2 pt-1">
              {feature.modes.map((m) => (
                <div key={m.name} className="flex items-start gap-2 text-sm">
                  <span className={`font-semibold shrink-0 ${c.icon}`}>{m.name}</span>
                  <span className="text-text-secondary/60 shrink-0">({m.min})</span>
                  <span className="text-text-secondary">— {m.desc}</span>
                </div>
              ))}
            </div>
          )}

          {feature.note && (
            <p className={`text-xs text-text-secondary italic border-l-2 pl-3 py-0.5 ${c.border}`}>
              {feature.note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function UserManualPage() {
  const router = useRouter();
  const [tab, setTab] = useState("guest");
  const active = sections.find((s) => s.id === tab);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header — same pattern as login/signup */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold mt-3">User Manual</h1>
        <p className="text-sm text-text-secondary mt-0.5">Everything you need to know about Vocabularium</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-surface-alt border border-border">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
              tab === s.id
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Intro */}
      <p className="text-sm text-text-secondary leading-relaxed">{active.intro}</p>

      {/* Feature cards */}
      <div className="flex flex-col gap-3">
        {active.features.map((f) => (
          <FeatureCard key={f.title} feature={f} />
        ))}
      </div>

      {/* Guest limitations */}
      {active.limits && (
        <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col gap-2">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Guest Limitations</p>
          <ul className="flex flex-col gap-2">
            {active.limits.map((l) => (
              <li key={l} className="flex items-start gap-2 text-sm text-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-400 shrink-0 mt-0.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                {l}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
