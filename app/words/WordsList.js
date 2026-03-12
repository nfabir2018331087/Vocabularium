"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A → Z" },
  { value: "z-a", label: "Z → A" },
  { value: "tags", label: "By Tag" },
];

export default function WordsList({ words }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaningEn.toLowerCase().includes(q) ||
        (w.meaningBn && w.meaningBn.includes(q)) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [words, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "newest":
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "a-z":
        return list.sort((a, b) => a.word.localeCompare(b.word));
      case "z-a":
        return list.sort((a, b) => b.word.localeCompare(a.word));
      case "tags":
        return list; // handled separately below
      default:
        return list;
    }
  }, [filtered, sort]);

  const groupedByTag = useMemo(() => {
    if (sort !== "tags") return null;
    const groups = {};
    filtered.forEach((w) => {
      if (w.tags.length === 0) {
        (groups["Untagged"] ??= []).push(w);
      } else {
        w.tags.forEach((t) => {
          (groups[t] ??= []).push(w);
        });
      }
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, sort]);

  return (
    <>
      {/* Search */}
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search words, meanings, or tags..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-sm text-text placeholder:text-text-secondary/50"
        />
      </div>

      {/* Sort */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              sort === opt.value
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-surface-alt border border-border text-text-secondary hover:text-text hover:border-text-secondary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-text-secondary">
        {filtered.length} word{filtered.length !== 1 ? "s" : ""}
        {search && ` matching "${search}"`}
      </p>

      {/* Word Cards */}
      {sort === "tags" && groupedByTag ? (
        <div className="flex flex-col gap-6">
          {groupedByTag.map(([tag, tagWords]) => (
            <div key={tag}>
              <h2 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {tag}
                <span className="text-text-secondary font-normal">({tagWords.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {tagWords.map((w) => (
                  <WordCard key={`${tag}-${w.id}`} word={w} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((w) => (
            <WordCard key={w.id} word={w} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary text-sm py-8">
          No words found.
        </p>
      )}
    </>
  );
}

function WordCard({ word }) {
  return (
    <Link
      href={`/words/${word.id}`}
      className="block p-4 rounded-xl bg-surface-alt border border-border hover:border-primary card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{word.word}</h3>
            {word.partOfSpeech && (
              <span className="text-xs text-text-secondary italic shrink-0">
                {word.partOfSpeech}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">
            {word.meaningEn}
          </p>
          {word.meaningBn && (
            <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">
              {word.meaningBn}
            </p>
          )}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-secondary shrink-0 mt-1">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      {word.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {word.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
