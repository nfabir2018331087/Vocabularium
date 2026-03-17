"use client";

import Link from "next/link";

export default function QuizResults({ result, words, onRestart, onRetry }) {
  const { score, total, missed, duration } = result;
  const safeTotal = total || 0;
  const percentage = safeTotal > 0 ? Math.round((score / safeTotal) * 100) : 0;

  let color = "text-emerald-500";
  let bgColor = "bg-emerald-500/10 border-emerald-500/30";
  let label = "Excellent!";
  if (safeTotal === 0) {
    color = "text-text-secondary";
    bgColor = "bg-surface-alt border-border";
    label = "No attempts";
  } else if (percentage < 50) {
    color = "text-red-400";
    bgColor = "bg-red-500/10 border-red-500/30";
    label = "Keep practicing!";
  } else if (percentage < 80) {
    color = "text-amber-500";
    bgColor = "bg-amber-500/10 border-amber-500/30";
    label = "Good effort!";
  }

  const missedWords = words.filter((w) => missed.includes(w.id));

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Score card */}
      <div className={`flex flex-col items-center gap-3 p-8 rounded-2xl border ${bgColor}`}>
        <p className={`text-5xl font-bold ${color}`}>{percentage}%</p>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
          <span>{score} / {total} correct</span>
          <span className="w-1 h-1 rounded-full bg-text-secondary" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Missed words */}
      {missedWords.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Words to review
          </h2>
          <div className="flex flex-col gap-2">
            {missedWords.map((w) => (
              <Link
                key={w.id}
                href={`/words/${w.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-alt border border-border hover:border-primary transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-sm">{w.word}</span>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">{w.meaningEn}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-secondary shrink-0 ml-2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          Try Again
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-3.5 rounded-2xl bg-surface-alt border border-border font-semibold text-sm text-text hover:border-primary transition-colors"
        >
          All Modes
        </button>
      </div>

      {/* Progress link */}
      <Link
        href="/progress"
        className="flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary font-medium transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        View Progress
      </Link>
    </div>
  );
}
