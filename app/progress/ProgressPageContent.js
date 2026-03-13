"use client";

import Link from "next/link";

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

export default function ProgressPageContent({ words, progress }) {
  const wordsWithAccuracy = words.map((w) => ({
    ...w,
    accuracy: getAccuracy(w.id, progress),
  }));

  // Sort: tested words first (lowest accuracy first), then untested
  wordsWithAccuracy.sort((a, b) => {
    if (a.accuracy === null && b.accuracy === null) return 0;
    if (a.accuracy === null) return 1;
    if (b.accuracy === null) return -1;
    return a.accuracy - b.accuracy;
  });

  const tested = wordsWithAccuracy.filter((w) => w.accuracy !== null);
  const untested = wordsWithAccuracy.filter((w) => w.accuracy === null);

  const overallCorrect = Object.values(progress).reduce((sum, s) => sum + (s.tested - s.missed), 0);
  const overallTotal = Object.values(progress).reduce((sum, s) => sum + s.tested, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : null;

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Progress</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            {words.length} word{words.length !== 1 ? "s" : ""} &middot; {tested.length} tested
          </p>
        </div>
      </div>

      {/* Overall stats */}
      {overallPct !== null && (
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${getAccuracyStyle(overallPct).bg} ${getAccuracyStyle(overallPct).border}`}>
          <p className={`text-3xl font-bold ${getAccuracyStyle(overallPct).color}`}>{overallPct}%</p>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Overall accuracy</p>
            <p className="text-xs text-text-secondary">{overallCorrect} / {overallTotal} correct across all quizzes</p>
          </div>
        </div>
      )}

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

      {/* Word list */}
      {wordsWithAccuracy.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {/* Tested words */}
          {tested.length > 0 && (
            <>
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
                Tested words
              </h2>
              {tested.map((w) => {
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
          {untested.length > 0 && (
            <>
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mt-3 mb-1">
                Not yet tested
              </h2>
              {untested.map((w) => (
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
    </div>
  );
}
