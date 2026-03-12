import Link from "next/link";
import { getWords } from "./actions/words";

export default async function Home() {
  const { words } = await getWords();
  const wordCount = words?.length || 0;
  const recentWords = words?.slice(0, 3) || [];
  const tagCount = new Set(words?.flatMap((w) => w.tags) || []).size;

  return (
    <div className="flex flex-col gap-6 -mx-4 -mt-6">
      {/* Hero Section */}
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Vocabularium
        </h1>
        <p className="text-white/75 mt-1 text-sm">
          Your personal vault for newly found words
        </p>

        {/* Stats */}
        <div className="flex gap-3 mt-6">
          <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-2xl font-bold text-white">{wordCount}</p>
            <p className="text-xs text-white/70">Words saved</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-2xl font-bold text-white">{tagCount}</p>
            <p className="text-xs text-white/70">Tags</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-2xl font-bold text-white">
              {wordCount > 0
                ? Math.ceil(
                    (Date.now() - new Date(words[words.length - 1].createdAt)) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0}
            </p>
            <p className="text-xs text-white/70">Days active</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <Link
          href="/add"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span className="text-sm font-semibold">Add Word</span>
        </Link>

        <Link
          href="/words"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-rose-400">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <span className="text-sm font-semibold">My Words</span>
        </Link>

        <Link
          href="/quiz"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-accent">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-sm font-semibold">Quiz</span>
        </Link>

        <Link
          href="/words"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-success">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="text-sm font-semibold">Progress</span>
        </Link>
      </div>

      {/* Recently Added */}
      {recentWords.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Recently Added
            </h2>
            <Link href="/words" className="text-xs text-primary font-medium">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentWords.map((w) => (
              <Link
                key={w.id}
                href={`/words/${w.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-alt border border-border card-hover hover:border-primary"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{w.word}</span>
                    {w.partOfSpeech && (
                      <span className="text-[10px] text-text-secondary italic px-1.5 py-0.5 rounded-full bg-surface border border-border">
                        {w.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {w.meaningEn}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-secondary shrink-0 ml-2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-text-secondary px-4 pb-2">
        <p>Store, organize, and practice your vocabulary</p>
      </div>
    </div>
  );
}
