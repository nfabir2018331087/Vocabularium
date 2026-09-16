"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";

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
        note: "AI Assist is not available in guest mode — use Dictionary Lookup to auto-fill what it can, or fill in everything manually. The app will warn you if you try to save a word that already exists in your library.",
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
        title: "Dictionary Lookup",
        color: "teal",
        steps: [
          'Tap the + button, then type a word.',
          'Tap the Dictionary button — it sits alone under Auto Fill since AI Assist isn\'t available in guest mode.',
          'English meaning, part of speech, explanation, and example sentences are fetched instantly and filled in.',
          'Review and edit anything before saving.',
        ],
        note: "Runs entirely in your browser against a free, open dictionary source — no account or AI involved, so it's instant. Only works for real English words; slang, names, and typos won't return a result.",
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
          'Tap Playground in the bottom nav.',
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
            <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ),
        title: "Learning Tracker",
        color: "green",
        steps: [
          'Go to Profile → Learning Tracker.',
          'Switch between the By Letters and By Tags tabs.',
          'Tap any letter or tag to cycle through three states: gray (not started), outlined (learning), filled (learned).',
          'Tap again to move to the next state; one more tap resets it back to not started.',
          'The stats bar at the top shows how many words are learned, learning, or remaining.',
          'If you add new words to a letter or tag later, that letter/tag automatically resets — so your progress always reflects your current library.',
        ],
        note: "The tracker stores progress per letter and tag — it is separate from quiz progress. Use it as a personal study planner alongside the quiz.",
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
      "No AI Story Generator",
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
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="9" y1="7" x2="15" y2="7" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
        ),
        title: "Dictionary Lookup",
        color: "blue",
        steps: [
          'Tap + to open the Add Word form.',
          'Type the word, then tap the Dictionary button under Auto Fill.',
          'English meaning, part of speech, explanation, and example sentences are fetched instantly and filled in.',
          'Tap AI Assist afterward for the Bengali meaning and tags — results from both combine instead of replacing each other.',
          'Review and edit anything before saving.',
        ],
        note: "Pulled from free, open dictionary sources — no AI involved, so it's instant. Only works for real English words; slang, names, and typos won't return a result. Part of Speech always follows Dictionary Lookup's result over AI Assist's.",
      },
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
          'Type the word, then tap the AI Assist button under Auto Fill.',
          'The AI fills in: English meaning, Bengali meaning, part of speech, explanation, example sentences, and tags.',
          'Use it alone, or after Dictionary Lookup — new results are added to what\'s already filled in, not overwritten.',
          'Review and edit anything before saving.',
        ],
        note: "Powered by Google Gemini, with Groq as an automatic backup if Gemini is unavailable. Results are fast and usually accurate.",
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
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
        title: "Friends",
        color: "primary",
        steps: [
          'Go to Profile → Friends.',
          'Tap Add Friend, enter their email address, and send a request.',
          'They will see your request on their Friends page and can Accept or Decline.',
          'Once accepted, they appear in your friends list.',
          'Tap the › button on any friend card to open a Share Word sheet — search your words and share one directly.',
          'To view all pending incoming requests, tap the "View all" link next to the requests section.',
          'To remove a friend, open the Share Word sheet, scroll to the bottom, and tap Remove from friend list.',
        ],
        note: "The friend list updates in real time after every action. You can search friends by name or email in the search bar.",
      },
      {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        ),
        title: "Learning Tracker",
        color: "green",
        steps: [
          'Go to Profile → Learning Tracker.',
          'Switch between the By Letters and By Tags tabs.',
          'Tap any letter or tag to cycle through three states: gray (not started), outlined (learning), filled (learned).',
          'Tap again to move to the next state; one more tap resets it back to not started.',
          'The stats bar at the top shows how many words are learned, learning, or remaining.',
          'If you add new words to a letter or tag later, that letter/tag automatically resets — so your progress always reflects your current library.',
        ],
        note: "The tracker stores progress per letter and tag — it is separate from quiz progress. Use it as a personal study planner alongside the quiz.",
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
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="9" y1="7" x2="15" y2="7" />
            <line x1="9" y1="11" x2="15" y2="11" />
          </svg>
        ),
        title: "AI Story Generator",
        color: "red",
        steps: [
          'Tap Playground in the bottom nav, then tap the Story Generator tile.',
          'Choose how many words to use — 10, 20, 50, or 100.',
          'Fill your selection using Search, Random, Letters, or Tags — mix and match until you hit your target.',
          'Tap Generate Story. The AI writes a short story that naturally uses every selected word, bolded in the text.',
          'Tap View all next to a story\'s word count to see its full word list in a scrollable grid.',
          'Tap the trash icon on a story to delete it.',
        ],
        note: "Powered by Google Gemini, with Groq as a backup. A fun way to see your vocabulary used in context — stories aren't graded and don't affect quiz progress.",
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
  teal:    { bg: "bg-teal-500/10",    icon: "text-teal-500",    border: "border-teal-500/20"    },
  red:     { bg: "bg-red-500/10",     icon: "text-red-500",     border: "border-red-500/20"     },
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
  const { isGuest } = useAuth();
  // null = no manual tab choice yet, so the default follows auth state:
  // account users land on Account, guests land on Guest. Once someone
  // clicks a tab, that pick sticks regardless of auth state.
  const [pickedTab, setPickedTab] = useState(null);
  const tab = pickedTab ?? (isGuest ? "guest" : "auth");
  const active = sections.find((s) => s.id === (isGuest ? "guest" : tab));

  return (
    <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
      {/* Header */}
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">User Manual</h1>
            <p className="text-sm text-white/75 mt-0.5">Everything you need to know about Vocabularium</p>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-surface-alt border border-border">
          {sections.map((s) => {
            const locked = isGuest && s.id !== "guest";
            return (
              <button
                key={s.id}
                onClick={() => !locked && setPickedTab(s.id)}
                disabled={locked}
                title={locked ? "Sign in to view the Account manual" : undefined}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
                  locked
                    ? "text-text-secondary/40 cursor-not-allowed"
                    : (isGuest ? "guest" : tab) === s.id
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                {s.label}
              </button>
            );
          })}
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
    </div>
  );
}
