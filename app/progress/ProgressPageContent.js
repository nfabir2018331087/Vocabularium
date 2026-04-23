"use client";

import Link from "next/link";
import { useMemo, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

function getAccuracy(wordId, progress) {
  const stat = progress[wordId];
  if (!stat || stat.tested === 0) return null;
  return Math.round(((stat.tested - stat.missed) / stat.tested) * 100);
}

function getAccuracyStyle(accuracy) {
  if (accuracy === null) return { color: "text-text-secondary", bg: "bg-surface-alt", border: "border-border", barColor: "bg-border" };
  if (accuracy >= 70) return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30", barColor: "bg-emerald-500" };
  if (accuracy >= 40) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30", barColor: "bg-amber-500" };
  return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", barColor: "bg-red-500" };
}

const SORT_OPTIONS = [
  { value: "accuracy-asc", label: "Accuracy ↑" },
  { value: "accuracy-desc", label: "Accuracy ↓" },
  { value: "frequency-asc", label: "Frequency ↑" },
  { value: "frequency-desc", label: "Frequency ↓" },
];

export default function ProgressPageContent({ words, progress }) {
  const PAGE_SIZES = [5, 10, 20];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") || "accuracy-asc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = (() => {
    const s = parseInt(searchParams.get("size") || "10", 10);
    return PAGE_SIZES.includes(s) ? s : 10;
  })();

  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const setPage = (fn) => updateParams({ page: typeof fn === "function" ? fn(page) : fn });
  const setPageSize = (v) => updateParams({ size: v, page: 1 });
  const setSort = (v) => updateParams({ sort: v, page: 1 });

  const wordsWithAccuracy = words.map((w) => ({
    ...w,
    accuracy: getAccuracy(w.id, progress),
  }));

  const tested = wordsWithAccuracy.filter((w) => w.accuracy !== null);
  const untested = wordsWithAccuracy.filter((w) => w.accuracy === null);

  const sortedTested = [...tested].sort((a, b) => {
    if (sort === "frequency-desc") return (progress[b.id]?.tested ?? 0) - (progress[a.id]?.tested ?? 0);
    if (sort === "frequency-asc") return (progress[a.id]?.tested ?? 0) - (progress[b.id]?.tested ?? 0);
    if (sort === "accuracy-desc") return b.accuracy - a.accuracy;
    // default: accuracy-asc (lowest accuracy first)
    return a.accuracy - b.accuracy;
  });

  const ordered = useMemo(() => [...sortedTested, ...untested], [sortedTested, untested]);

  const totalPages = Math.max(1, Math.ceil(ordered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paged = ordered.slice(startIndex, endIndex);
  const pagedTested = paged.filter((w) => w.accuracy !== null);
  const pagedUntested = paged.filter((w) => w.accuracy === null);

  const overallCorrect = Object.values(progress).reduce((sum, s) => sum + (s.tested - s.missed), 0);
  const overallTotal = Object.values(progress).reduce((sum, s) => sum + s.tested, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : null;

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-xs text-white/80 mt-0.5">
          {words.length} word{words.length !== 1 ? "s" : ""} &middot; {tested.length} tested
        </p>
        {overallPct !== null && (
          <div className="mt-4 flex items-center gap-4 p-4 rounded-2xl border border-white/20 bg-white/10">
            <p className="text-3xl font-bold text-white">{overallPct}%</p>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">Overall accuracy</p>
              <p className="text-xs text-white/70">{overallCorrect} / {overallTotal} correct across all quizzes</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 flex flex-col gap-5">

        {/* Empty state */}
        {words.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-text-secondary/40">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p className="text-sm text-text-secondary">Add some words and take quizzes to see your progress</p>
            <Link href="/add" className="text-sm text-primary font-medium">Add your first word</Link>
          </div>
        )}

        {/* No quiz data state */}
        {words.length > 0 && tested.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-text-secondary">Take a quiz to start tracking your progress</p>
            <Link href="/quiz" className="text-sm text-primary font-medium">Start a quiz</Link>
          </div>
        )}

        {/* Sort chips — only shown when there are tested words */}
        {tested.length > 0 && (
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
        )}

        {/* Word list */}
        {wordsWithAccuracy.length > 0 && (
          <div className="flex flex-col gap-1.5">
          {/* Tested words */}
          {pagedTested.length > 0 && (
            <>
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Tested words
              </h2>
              {pagedTested.map((w) => {
                const style = getAccuracyStyle(w.accuracy);
                const stat = progress[w.id];
                return (
                  <Link
                    key={w.id}
                    href={`/words/${w.id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors hover:border-primary ${style.border} bg-surface-alt`}
                  >
                    {/* Accuracy badge */}
                    <div className={`w-11 h-11 rounded-lg ${style.bg} flex items-center justify-center shrink-0`}>
                      <span className={`text-sm font-bold ${style.color}`}>{w.accuracy}%</span>
                    </div>
                    {/* Word info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{w.word}</span>
                        {w.partOfSpeech && (
                          <span className="text-[10px] text-text-secondary italic px-1.5 py-0.5 rounded-full bg-surface border border-border shrink-0">
                            {w.partOfSpeech}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                          <div className={`h-full ${style.barColor} rounded-full`} style={{ width: `${w.accuracy}%` }} />
                        </div>
                        <span className="text-[10px] text-text-secondary shrink-0">
                          {stat.tested - stat.missed}/{stat.tested}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </>
          )}

          {/* Untested words */}
          {pagedUntested.length > 0 && (
            <>
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mt-3 mb-1">
                Not yet tested
              </h2>
              {pagedUntested.map((w) => (
                <Link
                  key={w.id}
                  href={`/words/${w.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-alt transition-colors hover:border-primary"
                >
                  <div className="w-11 h-11 rounded-lg bg-surface-alt border border-border flex items-center justify-center shrink-0">
                    <span className="text-xs text-text-secondary">--</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">{w.word}</span>
                      {w.partOfSpeech && (
                        <span className="text-[10px] text-text-secondary italic px-1.5 py-0.5 rounded-full bg-surface border border-border shrink-0">
                          {w.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{w.meaningEn}</p>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      )}

        {ordered.length > 0 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              {PAGE_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
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
              Page {safePage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-surface-alt border border-border text-text-secondary disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-surface-alt border border-border text-text-secondary disabled:opacity-50"
            >
              Next
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
