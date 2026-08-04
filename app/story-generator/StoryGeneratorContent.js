"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateStory, getStories, deleteStory } from "../actions/story";
import { shuffle } from "../../lib/quiz-utils";
import Toast from "../components/Toast";
import { getCachedStories, setCachedStories, isStoriesFresh } from "../../lib/client-cache";

const STORIES_TTL_MS = 2 * 60 * 1000;
const COUNT_OPTIONS = [10, 20, 50, 100];
const PAGE_SIZES = [5, 10, 20];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PICK_MODES = [
  { value: "search", label: "Search", desc: "Find and add words yourself" },
  { value: "random", label: "Random", desc: "Shuffle a random set" },
  { value: "letters", label: "By Letters", desc: "Filter by starting letter" },
  { value: "tags", label: "By Tags", desc: "Filter by tags" },
];

function renderStoryText(content) {
  const parts = content.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-primary">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function StoryGeneratorContent({ words, userId }) {
  const router = useRouter();
  const wordCount = words.length;

  const countOptions = useMemo(() => COUNT_OPTIONS.filter((c) => c <= wordCount), [wordCount]);
  const [count, setCount] = useState(countOptions[0] ?? wordCount);

  const [pickMode, setPickMode] = useState("search");
  const [selectedWords, setSelectedWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  const [stories, setStories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingStories, setLoadingStories] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [viewingStory, setViewingStory] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const selectedIds = useMemo(() => new Set(selectedWords.map((w) => w.id)), [selectedWords]);
  const quotaReached = selectedWords.length >= count;

  useEffect(() => {
    setSelectedWords((prev) => (prev.length > count ? prev.slice(0, count) : prev));
  }, [count]);

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

  const visibleTags = tagSearch.trim()
    ? allTags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
    : allTags;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return words
      .filter((w) => !selectedIds.has(w.id) && w.word.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, words, selectedIds]);

  function addWord(word) {
    if (quotaReached || selectedIds.has(word.id)) return;
    setSelectedWords((prev) => [...prev, { id: word.id, word: word.word }]);
  }

  function removeWord(id) {
    setSelectedWords((prev) => prev.filter((w) => w.id !== id));
  }

  function handleShuffle() {
    setSelectedWords(shuffle(words).slice(0, count).map((w) => ({ id: w.id, word: w.word })));
  }

  function toggleTag(tag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function toggleLetter(letter) {
    setSelectedLetters((prev) => (prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]));
  }

  function pickFromTags() {
    const pool = words.filter((w) => (w.tags ?? []).some((t) => selectedTags.includes(t)));
    setSelectedWords(shuffle(pool).slice(0, count).map((w) => ({ id: w.id, word: w.word })));
  }

  function pickFromLetters() {
    const pool = words.filter((w) => w.word?.[0] && selectedLetters.includes(w.word[0].toUpperCase()));
    setSelectedWords(shuffle(pool).slice(0, count).map((w) => ({ id: w.id, word: w.word })));
  }

  const fetchStories = useCallback(async (nextPage, nextPageSize, { silent = false } = {}) => {
    if (!silent) setLoadingStories(true);
    const result = await getStories({ page: nextPage, pageSize: nextPageSize });
    const next = { stories: result.stories || [], total: result.total || 0, page: nextPage, pageSize: nextPageSize };
    setStories(next.stories);
    setTotal(next.total);
    setLoadingStories(false);
    if (userId) setCachedStories(userId, next);
  }, [userId]);

  useEffect(() => {
    const cached = userId ? getCachedStories(userId) : null;
    const matches = cached && cached.page === page && cached.pageSize === pageSize;
    const fresh = matches && isStoriesFresh(userId, STORIES_TTL_MS);

    if (matches) {
      setStories(cached.stories);
      setTotal(cached.total);
    }
    setLoadingStories(!matches);

    if (!fresh) {
      fetchStories(page, pageSize, { silent: matches });
    }
  }, [page, pageSize, userId, fetchStories]);

  async function handleGenerate() {
    if (selectedWords.length === 0 || generating) return;
    setGenerating(true);
    const result = await generateStory({ wordIds: selectedWords.map((w) => w.id) });
    setGenerating(false);

    if (result.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }

    setToast({ message: "Story generated!", type: "success" });
    setSelectedWords([]);
    setSelectedTags([]);
    setSelectedLetters([]);
    setSearchQuery("");
    if (page === 1) {
      fetchStories(1, pageSize);
    } else {
      setPage(1);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    const result = await deleteStory(id);
    setDeletingId(null);
    setConfirmingDeleteId(null);

    if (result.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }

    if (stories.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      fetchStories(page, pageSize);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

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
            <h1 className="text-2xl font-bold text-white">Story Generator</h1>
            <p className="text-sm text-white/75 mt-0.5">Turn your words into an AI-crafted story</p>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Generator section */}
        {wordCount === 0 ? (
          <div className="text-center py-12 flex flex-col items-center gap-3 bg-surface-alt border border-border rounded-2xl">
            <p className="text-text-secondary text-sm">Add some words first to generate a story</p>
            <Link href="/add" className="text-primary font-medium text-sm">
              Add your first word
            </Link>
          </div>
        ) : (
        <div className="bg-surface-alt border border-border rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">Story Length</p>
            <div className="flex gap-1.5">
              {COUNT_OPTIONS.map((c) => {
                const disabled = c > wordCount;
                return (
                  <button
                    key={c}
                    onClick={() => !disabled && setCount(c)}
                    disabled={disabled}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      disabled
                        ? "bg-surface border border-border text-text-secondary/40 cursor-not-allowed"
                        : count === c
                          ? "bg-primary text-white"
                          : "bg-surface border border-border text-text-secondary hover:border-primary hover:text-text"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">Word Pool</p>
            <div className="flex flex-col gap-1.5">
              {PICK_MODES.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    pickMode === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="pickMode"
                    value={opt.value}
                    checked={pickMode === opt.value}
                    onChange={() => setPickMode(opt.value)}
                    className="hidden"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      pickMode === opt.value ? "border-primary" : "border-border"
                    }`}
                  >
                    {pickMode === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{opt.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {pickMode === "search" && (
            <div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder={quotaReached ? "Quota reached — remove a word to add another" : "Search words to add…"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={quotaReached}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 rounded-lg border border-border divide-y divide-border max-h-44 overflow-y-auto">
                  {searchResults.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => addWord(w)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface transition-colors"
                    >
                      {w.word}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {pickMode === "random" && (
            <button
              onClick={handleShuffle}
              className="py-2.5 rounded-xl text-sm font-medium bg-surface border border-border text-text hover:border-primary transition-colors"
            >
              Shuffle {Math.min(count, wordCount)} random words
            </button>
          )}

          {pickMode === "letters" && (
            <div>
              <div className="grid grid-cols-7 gap-1 mb-3">
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
                          ? "bg-surface text-text-secondary/25 cursor-not-allowed"
                          : sel
                            ? "bg-primary text-white shadow-sm"
                            : "bg-surface border border-border text-text hover:border-primary hover:text-primary"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={pickFromLetters}
                disabled={selectedLetters.length === 0}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-surface border border-border text-text hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Pick words
              </button>
            </div>
          )}

          {pickMode === "tags" && (
            <div className="flex flex-col gap-2">
              {allTags.length === 0 ? (
                <p className="text-sm text-text-secondary py-2">No tags found. Add tags to your words first.</p>
              ) : (
                <>
                  {allTags.length > 6 && (
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search tags…"
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  )}
                  <div className="max-h-44 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                    {visibleTags.length === 0 ? (
                      <p className="text-sm text-text-secondary p-3">No matching tags</p>
                    ) : (
                      visibleTags.map((tag) => {
                        const checked = selectedTags.includes(tag);
                        return (
                          <label key={tag} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface cursor-pointer transition-colors">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-border"}`}>
                              {checked && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <input type="checkbox" checked={checked} onChange={() => toggleTag(tag)} className="hidden" />
                            <span className="text-sm flex-1">{tag}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                  <button
                    onClick={pickFromTags}
                    disabled={selectedTags.length === 0}
                    className="w-full py-2.5 rounded-xl text-sm font-medium bg-surface border border-border text-text hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Pick words
                  </button>
                </>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                Selected · {selectedWords.length}/{count}
              </p>
              {selectedWords.length > 0 && (
                <button onClick={() => setSelectedWords([])} className="text-xs text-text-secondary hover:text-text">
                  Clear all
                </button>
              )}
            </div>
            {selectedWords.length === 0 ? (
              <p className="text-sm text-text-secondary">No words selected yet.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedWords.map((w) => (
                  <span key={w.id} className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {w.word}
                    <button onClick={() => removeWord(w.id)} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary/20">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={selectedWords.length === 0 || generating}
            className={`relative py-3 rounded-xl text-sm font-semibold transition-all ${
              selectedWords.length === 0 || generating
                ? "bg-surface border border-border text-text-secondary/40 cursor-not-allowed"
                : "bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 text-white hover:opacity-95"
            }`}
          >
            {generating && (
              <span className="absolute -inset-1 rounded-xl blur-md bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 opacity-70" />
            )}
            <span className="relative">{generating ? "Generating story…" : "Generate Story"}</span>
          </button>
        </div>
        )}

        {/* Story history section */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Your Stories{total > 0 ? ` · ${total}` : ""}
          </p>

          {loadingStories ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => <div key={i} className="h-32 bg-surface-alt rounded-2xl skeleton" />)}
            </div>
          ) : stories.length === 0 ? (
            <p className="text-center text-text-secondary text-sm py-8">
              No stories yet — generate your first one above.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {stories.map((story) => {
                const expanded = expandedId === story.id;
                const preview = story.content.length > 220 && !expanded
                  ? `${story.content.slice(0, 220)}…`
                  : story.content;
                return (
                  <div key={story.id} className="p-4 rounded-xl bg-surface-alt border border-border">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{story.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
                          <span>{formatDate(story.createdAt)} · {story.wordCount} word{story.wordCount !== 1 ? "s" : ""}</span>
                          {story.wordsUsed?.length > 0 && (
                            <button
                              onClick={() => setViewingStory(story)}
                              className="text-primary font-medium hover:underline"
                            >
                              View all
                            </button>
                          )}
                        </p>
                      </div>
                      {confirmingDeleteId === story.id ? (
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleDelete(story.id)}
                            disabled={deletingId === story.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingId === story.id ? "…" : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmingDeleteId(null)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface border border-border text-text-secondary hover:text-text"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDeleteId(story.id)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed mt-3 whitespace-pre-wrap">
                      {renderStoryText(preview)}
                    </p>

                    {story.content.length > 220 && (
                      <button
                        onClick={() => setExpandedId(expanded ? null : story.id)}
                        className="text-xs text-primary font-medium mt-2"
                      >
                        {expanded ? "Show less" : "Read more"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => { setPageSize(size); setPage(1); }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                      pageSize === size
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                        : "bg-surface-alt border-border text-text-secondary hover:text-text hover:border-text-secondary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <span className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium bg-surface-alt border border-border text-text-secondary disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium bg-surface-alt border border-border text-text-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {viewingStory && (
        <WordsModal story={viewingStory} onClose={() => setViewingStory(null)} />
      )}
    </div>
  );
}

function WordsModal({ story, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[80vh] flex flex-col shadow-xl mb-16 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <div>
            <h2 className="text-base font-semibold">Words in this story</h2>
            <p className="text-xs text-text-secondary mt-0.5">{story.wordCount} word{story.wordCount !== 1 ? "s" : ""}</p>
          </div>
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

        <div className="overflow-y-auto flex-1 px-5 pb-5">
          <div className="grid grid-cols-3 gap-2">
            {story.wordsUsed.map((w, i) => (
              <span
                key={i}
                className="px-2 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium text-center truncate"
                title={w}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
