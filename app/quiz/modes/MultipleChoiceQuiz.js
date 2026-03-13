"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { shuffle, generateOptions } from "../../../lib/quiz-utils";

export default function MultipleChoiceQuiz({ words, allWords, onFinish, onQuit }) {
  const quizWords = words;
  const total = quizWords.length;

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);
  const [selected, setSelected] = useState(null);
  const [options, setOptions] = useState([]);
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
        onFinish({ score: newScore, total, missed: newMissed, duration, testedWordIds: quizWords.map((w) => w.id) });
      } else {
        setScore(newScore);
        setMissed(newMissed);
        setIndex((prev) => prev + 1);
      }
    }, 800);
  }, [selected, current, score, missed, index, total, onFinish]);

  const progress = (index / total) * 100;

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onQuit}
          className="text-sm text-text-secondary hover:text-text transition-colors"
        >
          Quit
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
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
