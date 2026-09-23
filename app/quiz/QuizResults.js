"use client";

import Link from "next/link";
import { truncateMeaning } from "../../lib/quiz-utils";

export default function QuizResults({ result, words, onRestart, onRetry, isGuest }) {
  const { score, total, missed, duration } = result;
  const safeTotal = total || 0;
  const percentage = safeTotal > 0 ? Math.round((score / safeTotal) * 100) : 0;
  const aiGrades = Array.isArray(result?.aiGrades) ? result.aiGrades : [];
  const aiLabel = result?.mode === "type_answer" && aiGrades.length > 0 && !isGuest;

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
    <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
      {/* Header */}
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onRestart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Results</h1>
            <p className="text-sm text-white/75 mt-0.5">{percentage}% • {label}</p>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-6">
      {/* Score card */}
      <div className={`flex flex-col items-center gap-3 p-8 rounded-2xl border ${bgColor}`}>
        <p className={`text-5xl font-bold ${color}`}>{percentage}%</p>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        {aiLabel && (
          <>
            <span className="text-[11px] uppercase tracking-wide text-text-secondary">
              Graded with AI
            </span>
            <p className="text-[10px] text-text-secondary/80 text-center">
              AI grading can make mistakes sometimes.
            </p>
          </>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
          <span>{score} / {total} correct</span>
          <span className="w-1 h-1 rounded-full bg-text-secondary" />
          <span>{timeStr}</span>
        </div>
      </div>

      {/* Missed words */}
      {aiGrades.length === 0 && missedWords.length > 0 && (
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
                  <span className="font-semibold text-sm break-words">{w.word}</span>
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

      {aiGrades.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Answer review
          </h2>
          <div className="flex flex-col gap-2">
            {aiGrades.map((g) => {
              let border = "border-emerald-500/30 bg-emerald-500/10 text-emerald-500";
              let label = "Correct";
              if (g.status === "wrong") {
                border = "border-red-500/30 bg-red-500/10 text-red-400";
                label = "Wrong";
              } else if (g.status === "pos_mismatch") {
                border = "border-amber-500/30 bg-amber-500/10 text-amber-500";
                label = "Partially correct";
              }
              return (
                <div key={g.id} className={`flex flex-col gap-1.5 p-3 rounded-xl border ${border}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-text break-words min-w-0">{g.word}</span>
                    <span className="text-[10px] uppercase tracking-wide shrink-0">{label}</span>
                  </div>
                  <div className="flex flex-col gap-1 text-xs text-text-secondary">
                    <div className="flex items-center gap-2">
                      <span>Your answer:</span>
                      <span className={`font-medium ${g.answer ? "text-text" : "text-text-secondary italic"}`}>
                        {g.answer || "Unanswered"}
                      </span>
                      {g.status === "pos_mismatch" && (
                        <span className="text-[10px] uppercase tracking-wide text-amber-500">POS mismatch</span>
                      )}
                      {g.status === "correct" && g.verdict && (
                        <span className="text-[10px] uppercase tracking-wide text-emerald-500">{g.verdict}</span>
                      )}
                      {g.status === "wrong" && g.verdict && g.answer && (
                        <span className="text-[10px] uppercase tracking-wide text-red-400">{g.verdict}</span>
                      )}
                    </div>
                    <div>
                      <span>Stored answer:</span>{" "}
                      <span className="text-text font-medium">{truncateMeaning(g.meaningEn, 100)}</span>
                    </div>
                  </div>
                  {g.status === "pos_mismatch" && (
                    <p className="text-[11px] text-amber-500/90">
                      [{g.note || "Wrong part of speech"}]
                    </p>
                  )}
                </div>
              );
            })}
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
    </div>
  );
}
