"use client";

import { useState } from "react";
import Link from "next/link";
import { QUIZ_MODES } from "../../lib/quiz-utils";

const modeIcons = {
  flashcard: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 2l-4 5-4-5" />
    </svg>
  ),
  multiple_choice: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  type_answer: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  match_pairs: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
};

const modeColors = {
  flashcard: "text-primary",
  multiple_choice: "text-accent",
  type_answer: "text-success",
  match_pairs: "text-rose-400",
};

export default function ModeSelect({ words, onSelect }) {
  const wordCount = words.length;
  const [count, setCount] = useState(() => {
    if (wordCount <= 5) return wordCount;
    if (wordCount <= 10) return wordCount;
    return 10;
  });

  const countOptions = [];
  if (wordCount >= 5) countOptions.push(5);
  if (wordCount >= 10) countOptions.push(10);
  if (wordCount > 10) countOptions.push(wordCount);
  // If fewer than 5, only "all" option
  if (countOptions.length === 0) countOptions.push(wordCount);

  if (wordCount === 0) {
    return (
      <div className="flex flex-col gap-4 -mx-4 -mt-6 pb-8">
        <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
          <h1 className="text-2xl font-bold text-white">Quiz</h1>
          <p className="text-sm text-white/75 mt-0.5">Practice your words with quick modes</p>
        </div>
        <div className="px-4">
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">Add some words first to start a quiz</p>
            <Link href="/add" className="text-primary font-medium text-sm">
              Add your first word
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 -mx-4 -mt-6 pb-8">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Quiz</h1>
            <p className="text-sm text-white/75 mt-0.5">{wordCount} word{wordCount !== 1 ? "s" : ""} available</p>
          </div>
          <Link
            href="/progress"
            className="flex items-center gap-1.5 text-xs text-white/80 hover:text-white font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Progress
          </Link>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Word count selector */}
        {countOptions.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Words:</span>
            <div className="flex gap-1.5">
              {countOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    count === c
                      ? "bg-primary text-white"
                      : "bg-surface-alt border border-border text-text-secondary hover:border-primary hover:text-text"
                  }`}
                >
                  {c === wordCount ? "All" : c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {QUIZ_MODES.map((m) => {
            const disabled = wordCount < m.minWords;
            return (
              <button
                key={m.id}
                onClick={() => !disabled && onSelect(m.id, m.id === "match_pairs" ? null : count)}
                disabled={disabled}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border text-center transition-all ${
                  disabled
                    ? "bg-surface-alt border-border opacity-40 cursor-not-allowed"
                    : "bg-surface-alt border-border card-hover hover:border-primary"
                }`}
              >
                {m.id === "type_answer" && (
                    <span
                      className={`absolute top-2 right-2 ${
                        disabled ? "text-text-secondary/60" : "text-violet-300"
                      }`}
                      title="AI assisted"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 3l1.6 3.3L17 8l-3.4 1.7L12 13l-1.6-3.3L7 8l3.4-1.7L12 3z" />
                        <path d="M5 14l.9 1.8L8 17l-2.1 1.2L5 20l-.9-1.8L2 17l2.1-1.2L5 14z" />
                        <path d="M18.5 14.5l1.1 2.2L22 18l-2.4 1.3-1.1 2.2-1.1-2.2L15 18l2.4-1.3 1.1-2.2z" />
                      </svg>
                    </span>
                  )}
                <div className="relative">
                  <span className={disabled ? "text-text-secondary" : modeColors[m.id]}>
                    {modeIcons[m.id]}
                  </span>
                </div>
                <span className="text-sm font-semibold">{m.label}</span>
                <span className="text-xs text-text-secondary">{m.description}</span>
                {disabled && (
                  <span className="text-[10px] text-red-400">Need {m.minWords}+ words</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
