import Link from "next/link";
import { useState } from "react";
import WordsList from "./WordsList";

export default function WordsPageContent({ words, error }) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Words</h1>
          <Link
            href="/add"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </Link>
        </div>
        <p className="text-sm text-white/75 mt-1">Search, sort, and manage your vocabulary</p>
        <div className="relative mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words, meanings, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-sm text-white placeholder:text-white/60"
          />
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {words.length === 0 && !error ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
            </div>
            <p className="text-text-secondary">No words yet</p>
            <Link href="/add" className="text-primary font-medium text-sm">
              Add your first word
            </Link>
          </div>
        ) : (
          <WordsList words={words} searchInHero={true} searchValue={search} onSearchChange={setSearch} />
        )}
      </div>
    </div>
  );
}
