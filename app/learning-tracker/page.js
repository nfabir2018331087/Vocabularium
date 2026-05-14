"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getWords } from "../actions/words";
import { getTrackerData, saveTrackerData } from "../actions/tracker";
import { useAuth } from "../components/AuthProvider";
import { getCachedWords, setCachedWords, getCachedTracker, setCachedTracker } from "../../lib/client-cache";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const STATE_CYCLE = [null, "learning", "learned"];

function cycleState(current) {
  const idx = STATE_CYCLE.indexOf(current ?? null);
  return STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];
}

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// Reset any letter/tag whose stored word count no longer matches current count
function reconcile(stored, wordCounts) {
  let changed = false;
  const next = { ...stored };
  for (const key of Object.keys(next)) {
    const entry = next[key];
    const currentCount = wordCounts[key] || 0;
    if (!entry || entry.count !== currentCount) {
      delete next[key];
      changed = true;
    }
  }
  return { data: next, changed };
}

function letterButtonClass(state, available) {
  if (!available) return "bg-surface-alt text-text-secondary/25 cursor-not-allowed";
  if (state === "learned") return "bg-primary text-white shadow-sm";
  if (state === "learning") return "border-2 border-primary text-primary bg-surface-alt";
  return "bg-surface-alt border border-border text-text hover:border-primary hover:text-primary";
}

function tagButtonClass(state) {
  if (state === "learned") return "bg-primary text-white shadow-sm";
  if (state === "learning") return "border-2 border-primary text-primary bg-surface-alt";
  return "bg-surface-alt border border-border text-text hover:border-primary hover:text-primary";
}

function StatsRow({ learned, learning, notLearned }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-primary inline-block" />
        {learned} learned
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-primary/40 text-primary text-xs font-semibold">
        <span className="w-2 h-2 rounded-full border-2 border-primary inline-block" />
        {learning} learning
      </span>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-alt border border-border text-text-secondary text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-border inline-block" />
        {notLearned} remaining
      </span>
    </div>
  );
}

const GUEST_STORAGE_KEY = "vocab-tracker-guest";

export default function LearningTrackerPage() {
  const router = useRouter();
  const { isGuest, loading: authLoading, user } = useAuth();
  const [tab, setTab] = useState("letters");
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  // Shape: { [letter]: { state: "learned"|"learning", count: number } }
  const [letterStates, setLetterStates] = useState({});
  const [tagStates, setTagStates] = useState({});
  const saveTimerRef = useRef(null);

  const scheduleSave = useCallback((nextLetters, nextTags) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const data = { letters: nextLetters, tags: nextTags };
      saveTrackerData(data);
      if (user?.id) setCachedTracker(user.id, data);
    }, 800);
  }, [user?.id]);

  // Load words + tracker state, then reconcile counts
  useEffect(() => {
    if (authLoading) return;
    async function load() {
      const userId = user?.id;

      // 1. Load words — use client cache for auth users
      let loadedWords = [];
      if (isGuest) {
        const { getLocalWords } = await import("../../lib/local-words");
        loadedWords = (await getLocalWords()) || [];
      } else {
        const cached = getCachedWords(userId);
        if (cached) {
          loadedWords = cached;
          setWords(cached);
          setLoading(false); // show content immediately from cache
        }
        // Always fetch fresh words to ensure reconciliation accuracy
        const { words: w } = await getWords();
        loadedWords = w || [];
        setCachedWords(userId, loadedWords);
      }
      setWords(loadedWords);

      // 2. Compute current word counts per letter and tag
      const letterWordCounts = {};
      const tagWordCounts = {};
      loadedWords.forEach((w) => {
        const l = w.word?.[0]?.toUpperCase();
        if (l) letterWordCounts[l] = (letterWordCounts[l] || 0) + 1;
        (w.tags ?? []).forEach((t) => {
          if (t) tagWordCounts[t] = (tagWordCounts[t] || 0) + 1;
        });
      });

      // 3. Load stored tracker state — use client cache for auth users
      let rawLetters = {}, rawTags = {};
      if (isGuest) {
        rawLetters = loadFromStorage(`${GUEST_STORAGE_KEY}-letters`);
        rawTags = loadFromStorage(`${GUEST_STORAGE_KEY}-tags`);
      } else {
        const cachedTracker = getCachedTracker(userId);
        if (cachedTracker) {
          rawLetters = cachedTracker.letters || {};
          rawTags = cachedTracker.tags || {};
        } else {
          const { data } = await getTrackerData();
          rawLetters = data?.letters || {};
          rawTags = data?.tags || {};
          setCachedTracker(userId, { letters: rawLetters, tags: rawTags });
        }
      }

      // 4. Reconcile: reset any letter/tag whose count changed
      const { data: reconciledLetters, changed: lChanged } = reconcile(rawLetters, letterWordCounts);
      const { data: reconciledTags, changed: tChanged } = reconcile(rawTags, tagWordCounts);

      setLetterStates(reconciledLetters);
      setTagStates(reconciledTags);

      // 5. Persist the reconciled data if anything was reset
      if (lChanged || tChanged) {
        if (isGuest) {
          if (lChanged) saveToStorage(`${GUEST_STORAGE_KEY}-letters`, reconciledLetters);
          if (tChanged) saveToStorage(`${GUEST_STORAGE_KEY}-tags`, reconciledTags);
        } else {
          const reconciled = { letters: reconciledLetters, tags: reconciledTags };
          saveTrackerData(reconciled);
          setCachedTracker(userId, reconciled);
        }
      }

      setLoading(false);
    }
    load();
  }, [authLoading, isGuest]);

  const availableLetters = useMemo(() => {
    const s = new Set();
    words.forEach((w) => { if (w.word?.[0]) s.add(w.word[0].toUpperCase()); });
    return s;
  }, [words]);

  const letterWordCounts = useMemo(() => {
    const counts = {};
    words.forEach((w) => {
      const l = w.word?.[0]?.toUpperCase();
      if (l) counts[l] = (counts[l] || 0) + 1;
    });
    return counts;
  }, [words]);

  const allTags = useMemo(() => {
    const s = new Set();
    words.forEach((w) => (w.tags ?? []).forEach((t) => { if (t) s.add(t); }));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [words]);

  const tagWordCounts = useMemo(() => {
    const counts = {};
    words.forEach((w) => (w.tags ?? []).forEach((t) => {
      if (t) counts[t] = (counts[t] || 0) + 1;
    }));
    return counts;
  }, [words]);

  function toggleLetter(letter) {
    if (!availableLetters.has(letter)) return;
    const count = letterWordCounts[letter] || 0;
    setLetterStates((prev) => {
      const currentState = prev[letter]?.state ?? null;
      const newState = cycleState(currentState);
      const next = { ...prev };
      if (newState === null) {
        delete next[letter];
      } else {
        next[letter] = { state: newState, count };
      }
      if (isGuest) {
        saveToStorage(`${GUEST_STORAGE_KEY}-letters`, next);
      } else {
        scheduleSave(next, tagStates);
      }
      return next;
    });
  }

  function toggleTag(tag) {
    const count = tagWordCounts[tag] || 0;
    setTagStates((prev) => {
      const currentState = prev[tag]?.state ?? null;
      const newState = cycleState(currentState);
      const next = { ...prev };
      if (newState === null) {
        delete next[tag];
      } else {
        next[tag] = { state: newState, count };
      }
      if (isGuest) {
        saveToStorage(`${GUEST_STORAGE_KEY}-tags`, next);
      } else {
        scheduleSave(letterStates, next);
      }
      return next;
    });
  }

  const letterCounts = useMemo(() => {
    const learned = words.filter((w) => letterStates[w.word?.[0]?.toUpperCase()]?.state === "learned").length;
    const learning = words.filter((w) => letterStates[w.word?.[0]?.toUpperCase()]?.state === "learning").length;
    const notLearned = words.filter((w) => {
      const l = w.word?.[0]?.toUpperCase();
      return l && availableLetters.has(l) && !letterStates[l];
    }).length;
    return { learned, learning, notLearned };
  }, [letterStates, availableLetters, words]);

  const tagCounts = useMemo(() => {
    const taggedWords = words.filter((w) => (w.tags ?? []).length > 0);
    const learned = taggedWords.filter((w) => (w.tags ?? []).some((t) => tagStates[t]?.state === "learned")).length;
    const learning = taggedWords.filter((w) =>
      !(w.tags ?? []).some((t) => tagStates[t]?.state === "learned") &&
      (w.tags ?? []).some((t) => tagStates[t]?.state === "learning")
    ).length;
    const notLearned = taggedWords.filter((w) =>
      !(w.tags ?? []).some((t) => tagStates[t]?.state === "learned") &&
      !(w.tags ?? []).some((t) => tagStates[t]?.state === "learning")
    ).length;
    return { learned, learning, notLearned };
  }, [tagStates, words]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
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
        <h1 className="text-2xl font-bold mt-3">Learning Tracker</h1>
        <p className="text-sm text-text-secondary mt-0.5">Track your learning progress by letter or tag</p>
      </div>

      {/* Tab toggler */}
      <div className="flex gap-2 p-1 rounded-2xl bg-surface-alt border border-border">
        {[
          { id: "letters", label: "By Letters" },
          { id: "tags", label: "By Tags" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-primary text-white shadow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-8 w-24 bg-surface-alt rounded-full skeleton" />)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {LETTERS.map((l) => <div key={l} className="aspect-square bg-surface-alt rounded-lg skeleton" />)}
          </div>
        </div>
      ) : tab === "letters" ? (
        <div className="flex flex-col gap-4">
          <StatsRow {...letterCounts} />
          {availableLetters.size === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">Add some words to start tracking by letter.</p>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {LETTERS.map((letter) => {
                const available = availableLetters.has(letter);
                const state = letterStates[letter]?.state ?? null;
                return (
                  <button
                    key={letter}
                    onClick={() => toggleLetter(letter)}
                    disabled={!available}
                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all ${letterButtonClass(state, available)}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <StatsRow {...tagCounts} />
          {allTags.length === 0 ? (
            <p className="text-sm text-text-secondary py-4 text-center">No tags found. Add tags to your words first.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const state = tagStates[tag]?.state ?? null;
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${tagButtonClass(state)}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 p-4 rounded-2xl bg-surface-alt border border-border flex flex-col gap-3">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">How it works</p>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="w-7 h-7 shrink-0 rounded-lg bg-surface border border-border flex items-center justify-center text-xs font-bold text-text">A</span>
            <span><span className="font-medium text-text">Gray</span> — not started yet</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="w-7 h-7 shrink-0 rounded-lg border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">A</span>
            <span><span className="font-medium text-primary">Outlined</span> — currently learning</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="w-7 h-7 shrink-0 rounded-lg bg-primary flex items-center justify-center text-xs font-bold text-white">A</span>
            <span><span className="font-medium text-primary">Filled</span> — fully learned</span>
          </div>
          <p className="text-xs text-text-secondary pt-1 border-t border-border">
            Tap any {tab === "letters" ? "letter" : "tag"} to cycle through states. If new words are added to a {tab === "letters" ? "letter" : "tag"}, it resets automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
