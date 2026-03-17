"use client";

import { useState, useRef } from "react";

export default function FlashcardQuiz({ words, onFinish, onQuit }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState([]);
  const [missed, setMissed] = useState([]);
  const [testedIds, setTestedIds] = useState([]);
  const startTime = useRef(Date.now());

  const current = words[index];
  const total = words.length;
  const progress = ((index) / total) * 100;

  function handleAnswer(gotIt) {
    if (gotIt) {
      setKnown((prev) => [...prev, current.id]);
    } else {
      setMissed((prev) => [...prev, current.id]);
    }
    setTestedIds((prev) => [...prev, current.id]);

    if (index + 1 >= total) {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const finalKnown = gotIt ? known.length + 1 : known.length;
      const finalMissed = gotIt ? missed : [...missed, current.id];
      const finalTested = [...testedIds, current.id];
      onFinish({
        score: finalKnown,
        total: finalTested.length,
        missed: finalMissed,
        duration,
        testedWordIds: finalTested,
      });
    } else {
      setIndex((prev) => prev + 1);
      setFlipped(false);
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

      {/* Card */}
      <div className="perspective-[600px] mt-4">
        <div
          onClick={() => !flipped && setFlipped(true)}
          className={`relative w-full min-h-[280px] rounded-2xl border border-border cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center p-6 rounded-2xl bg-surface-alt">
            <p className="text-3xl font-bold text-center">{current.word}</p>
            {current.partOfSpeech && (
              <span className="text-xs text-text-secondary italic mt-2 px-2 py-0.5 rounded-full bg-surface border border-border">
                {current.partOfSpeech}
              </span>
            )}
            <p className="text-xs text-text-secondary mt-6">Tap to reveal</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-xl font-semibold text-center">{current.meaningEn}</p>
            {current.explanation && (
              <p className="text-sm text-text-secondary text-center mt-3 max-w-xs">
                {current.explanation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Answer buttons */}
      {flipped && (
        <div className="flex gap-3 animate-fade-in">
          <button
            onClick={() => handleAnswer(false)}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Missed it
          </button>
          <button
            onClick={() => handleAnswer(true)}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
          >
            Got it
          </button>
        </div>
      )}

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
              score: known.length,
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
