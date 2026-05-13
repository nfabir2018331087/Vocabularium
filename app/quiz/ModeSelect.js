"use client";

import { useState, useEffect, useMemo } from "react";
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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function QuizConfigModal({ mode, words, onStart, onClose }) {
  const [filterType, setFilterType] = useState("random");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [tagSearch, setTagSearch] = useState("");

  const allTags = useMemo(() => {
    const s = new Set();
    words.forEach((w) => (w.tags ?? []).forEach((t) => { if (t) s.add(t); }));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [words]);

  const availableLetters = useMemo(() => {
    const s = new Set();
    words.forEach((w) => { if (w.word?.[0]) s.add(w.word[0].toUpperCase()); });
    return s;
  }, [words]);

  const filteredWords = useMemo(() => {
    if (filterType === "tags" && selectedTags.length > 0) {
      return words.filter((w) => (w.tags ?? []).some((t) => selectedTags.includes(t)));
    }
    if (filterType === "letters" && selectedLetters.length > 0) {
      return words.filter((w) => w.word?.[0] && selectedLetters.includes(w.word[0].toUpperCase()));
    }
    return words;
  }, [words, filterType, selectedTags, selectedLetters]);

  const filteredCount = filteredWords.length;

  const countOptions = useMemo(() => {
    const opts = [];
    if (filteredCount >= 5) opts.push(5);
    if (filteredCount > 10) opts.push(10);
    if (filteredCount > 5) opts.push(filteredCount); // "All" — only when there's a real choice
    if (opts.length === 0) opts.push(filteredCount);
    return opts;
  }, [filteredCount]);

  const [count, setCount] = useState(words.length);

  useEffect(() => {
    setCount((prev) =>
      countOptions.includes(prev) ? prev : countOptions[countOptions.length - 1] ?? 0
    );
  }, [countOptions]);

  const visibleTags = tagSearch.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
    : allTags;

  const toggleTag = (tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const toggleLetter = (l) =>
    setSelectedLetters((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    );

  const canStart = filteredCount >= mode.minWords;

  const handleStart = () => {
    if (!canStart) return;
    onStart({
      count: mode.id === "match_pairs" ? null : count,
      filterType,
      filterValues:
        filterType === "tags"
          ? selectedTags
          : filterType === "letters"
          ? selectedLetters
          : [],
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[88vh] flex flex-col shadow-xl mb-16 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <h2 className="text-base font-semibold">{mode.label}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-secondary transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-3 flex flex-col gap-4">

          {/* Filter type */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">Word Pool</p>
            <div className="flex flex-col gap-1.5">
              {[
                { value: "random", label: "Random", desc: "Weighted by your progress" },
                { value: "tags", label: "By Tags", desc: "Choose specific tags" },
                { value: "letters", label: "By Letters", desc: "Filter by starting letter" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    filterType === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="filterType"
                    value={opt.value}
                    checked={filterType === opt.value}
                    onChange={() => {
                      setFilterType(opt.value);
                      setSelectedTags([]);
                      setSelectedLetters([]);
                      setTagSearch("");
                    }}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      filterType === opt.value ? "border-primary" : "border-border"
                    }`}
                  >
                    {filterType === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{opt.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tags selector */}
          {filterType === "tags" && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                Select Tags
                {selectedTags.length > 0 && (
                  <span className="normal-case ml-1 text-primary font-normal">
                    · {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""},{" "}
                    {filteredCount} word{filteredCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              {allTags.length === 0 ? (
                <p className="text-sm text-text-secondary py-2">
                  No tags found. Add tags to your words first.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {allTags.length > 6 && (
                    <div className="relative">
                      <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search tags…"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm bg-surface-alt border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )}
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                    {visibleTags.length === 0 ? (
                      <p className="text-sm text-text-secondary p-3">No matching tags</p>
                    ) : (
                      visibleTags.map((tag) => {
                        const tagWordCount = words.filter((w) =>
                          (w.tags ?? []).includes(tag)
                        ).length;
                        const checked = selectedTags.includes(tag);
                        return (
                          <label
                            key={tag}
                            className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-alt cursor-pointer transition-colors"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                                checked ? "bg-primary border-primary" : "border-border"
                              }`}
                            >
                              {checked && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTag(tag)}
                              className="hidden"
                            />
                            <span className="text-sm flex-1">{tag}</span>
                            <span className="text-xs text-text-secondary">{tagWordCount}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Letters selector */}
          {filterType === "letters" && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                Select Letters
                {selectedLetters.length > 0 && (
                  <span className="normal-case ml-1 text-primary font-normal">
                    · {selectedLetters.length} letter{selectedLetters.length !== 1 ? "s" : ""},{" "}
                    {filteredCount} word{filteredCount !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-7 gap-1">
                {LETTERS.map((letter) => {
                  const has = availableLetters.has(letter);
                  const sel = selectedLetters.includes(letter);
                  return (
                    <button
                      key={letter}
                      onClick={() => has && toggleLetter(letter)}
                      disabled={!has}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        !has
                          ? "bg-surface-alt text-text-secondary/25 cursor-not-allowed"
                          : sel
                          ? "bg-primary text-white shadow-sm"
                          : "bg-surface-alt border border-border text-text hover:border-primary hover:text-primary"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz size — hidden for match_pairs and when only one option */}
          {mode.id !== "match_pairs" && countOptions.length > 1 && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">Quiz Size</p>
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
                    {c === filteredCount ? "All" : c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Warning if not enough words */}
          {!canStart && (
            <p className="text-xs text-red-400">
              {filterType !== "random" &&
              (selectedTags.length > 0 || selectedLetters.length > 0)
                ? `Not enough matching words. Need at least ${mode.minWords}.`
                : `Need at least ${mode.minWords} words for this mode.`}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-alt border border-border text-text-secondary hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              canStart
                ? "bg-primary text-white hover:opacity-90 active:opacity-80"
                : "bg-surface-alt text-text-secondary/40 cursor-not-allowed"
            }`}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModeSelect({ words, onSelect, isGuest }) {
  const wordCount = words.length;
  const [modalMode, setModalMode] = useState(null);

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

      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          {QUIZ_MODES.map((m) => {
            const disabled = wordCount < m.minWords;
            return (
              <button
                key={m.id}
                onClick={() => !disabled && setModalMode(m.id)}
                disabled={disabled}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border text-center transition-all ${
                  disabled
                    ? "bg-surface-alt border-border opacity-40 cursor-not-allowed"
                    : "bg-surface-alt border-border card-hover hover:border-primary"
                }`}
              >
                {m.id === "type_answer" && !isGuest && (
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

      {modalMode && (
        <QuizConfigModal
          mode={QUIZ_MODES.find((m) => m.id === modalMode)}
          words={words}
          onStart={(config) => {
            setModalMode(null);
            onSelect(modalMode, config);
          }}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
}