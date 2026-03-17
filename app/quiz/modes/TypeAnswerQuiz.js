"use client";

import { useState, useRef } from "react";
import { fuzzyMatch } from "../../../lib/quiz-utils";

export default function TypeAnswerQuiz({ words, onFinish, onQuit }) {
  const quizWords = words;
  const total = quizWords.length;

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);
  const [testedIds, setTestedIds] = useState([]);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const startTime = useRef(Date.now());
  const inputRef = useRef(null);

  const current = quizWords[index];
  const progress = (index / total) * 100;

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || submitted) return;

    const correct = fuzzyMatch(input, current.meaningEn);
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      setScore((prev) => prev + 1);
    } else {
      setMissed((prev) => [...prev, current.id]);
    }
    setTestedIds((prev) => [...prev, current.id]);
  }

  function handleNext() {
    const newScore = score;
    const newMissed = missed;

    if (index + 1 >= total) {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const finalTested = [...testedIds];
      onFinish({ score: newScore, total: finalTested.length, missed: newMissed, duration, testedWordIds: finalTested });
    } else {
      setIndex((prev) => prev + 1);
      setInput("");
      setSubmitted(false);
      setIsCorrect(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onQuit}
          className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <span className="text-sm text-text-secondary font-medium">
          {index + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Word */}
      <div className="flex flex-col items-center gap-2 py-8">
        <p className="text-3xl font-bold text-center">{current.word}</p>
        {current.partOfSpeech && (
          <span className="text-xs text-text-secondary italic px-2 py-0.5 rounded-full bg-surface-alt border border-border">
            {current.partOfSpeech}
          </span>
        )}
        <p className="text-xs text-text-secondary mt-2">Type the English meaning</p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          autoFocus
          placeholder="Your answer..."
          className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-text placeholder:text-text-secondary/50 ${
            submitted
              ? isCorrect
                ? "bg-emerald-500/10 border-emerald-500/50"
                : "bg-red-500/10 border-red-500/50"
              : "bg-surface-alt border-border focus:border-primary"
          }`}
        />

        {!submitted ? (
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 active:scale-[0.98]"
          >
            Check
          </button>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in">
            {/* Feedback */}
            <div className={`px-4 py-3 rounded-xl border text-sm ${
              isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}>
              {isCorrect ? (
                <p className="font-medium">Correct!</p>
              ) : (
                <div>
                  <p className="font-medium">Not quite</p>
                  <p className="mt-1 text-text-secondary">
                    Correct answer: <span className="text-text font-medium">{current.meaningEn}</span>
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 active:scale-[0.98]"
            >
              {index + 1 >= total ? "See Results" : "Next"}
            </button>
          </div>
        )}
      </form>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onQuit}
          className="px-4 py-2 rounded-xl bg-surface-alt border border-border text-sm font-semibold text-text-secondary hover:text-text hover:border-text-secondary transition-colors"
        >
          Quit
        </button>
        <button
          onClick={() => {
            if (testedIds.length === 0) return;
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            onFinish({
              score,
              total: testedIds.length,
              missed,
              duration,
              testedWordIds: testedIds,
            });
          }}
          disabled={testedIds.length === 0}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
