"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { shuffle, generateOptions, truncateMeaning } from "../../../lib/quiz-utils";

export default function MultipleChoiceQuiz({ words, allWords, onFinish, onQuit }) {
  const quizWords = words;
  const total = quizWords.length;

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
  const [testedIds, setTestedIds] = useState([]);
  const startTime = useRef(Date.now());

  const current = quizWords[index];

  // Generate options for current question
  useEffect(() => {
    if (!current) return;
    const wrong = generateOptions(current, allWords, 3);
    setOptions(shuffle([current.meaningEn, ...wrong]));
    setSelected(null);
  }, [index, current, allWords]);

  const handleSelect = useCallback((option) => {
    if (selected !== null) return;
    setSelected(option);

    const isCorrect = option === current.meaningEn;
    const newScore = isCorrect ? score + 1 : score;
    const newMissed = isCorrect ? missed : [...missed, current.id];

    setTimeout(() => {
      if (index + 1 >= total) {
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        const finalTested = [...testedIds, current.id];
        onFinish({ score: newScore, total: finalTested.length, missed: newMissed, duration, testedWordIds: finalTested });
      } else {
        setScore(newScore);
        setMissed(newMissed);
        setTestedIds((prev) => [...prev, current.id]);
        setIndex((prev) => prev + 1);
      }
    }, 800);
  }, [selected, current, score, missed, index, total, onFinish, testedIds]);

  function handleSkip() {
    if (selected !== null) return;
    const newMissed = [...missed, current.id];
    const newTestedIds = [...testedIds, current.id];
    if (index + 1 >= total) {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      onFinish({ score, total: newTestedIds.length, missed: newMissed, duration, testedWordIds: newTestedIds });
    } else {
      setMissed(newMissed);
      setTestedIds(newTestedIds);
      setIndex((prev) => prev + 1);
    }
  }

  const progress = (index / total) * 100;

  return (
    <div className="flex flex-col gap-5 pb-8 -mx-4 -mt-6">
      {/* Header */}
      <div className="hero-gradient px-6 pt-10 pb-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onQuit}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Multiple Choice</h1>
              <p className="text-sm text-white/75 mt-0.5">Question {index + 1} of {total}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            disabled={selected !== null}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            Skip
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5">
      {/* Word */}
      <div className="flex flex-col items-center gap-2 py-8">
        <p className="text-3xl font-bold text-center break-words w-full min-w-0">{current.word}</p>
        {current.partOfSpeech && (
          <span className="text-xs text-text-secondary italic px-2 py-0.5 rounded-full bg-surface-alt border border-border">
            {current.partOfSpeech}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2.5">
        {options.map((option, i) => {
          let style = "bg-surface-alt border-border hover:border-primary";
          if (selected !== null) {
            if (option === current.meaningEn) {
              style = "bg-emerald-500/10 border-emerald-500/50 text-emerald-500";
            } else if (option === selected) {
              style = "bg-red-500/10 border-red-500/50 text-red-400 animate-shake";
            } else {
              style = "bg-surface-alt border-border opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(option)}
              disabled={selected !== null}
              className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${style}`}
            >
              {truncateMeaning(option, 70)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onQuit}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
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
    </div>
  );
}