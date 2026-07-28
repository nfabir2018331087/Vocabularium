"use client";

import { useState, useRef, useCallback } from "react";
import { generateMatchPairs } from "../../../lib/quiz-utils";

const PAIR_COUNT = 5;

export default function MatchPairsQuiz({ words, onFinish, onQuit }) {
  const [pairs] = useState(() => generateMatchPairs(words, PAIR_COUNT));
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const startTime = useRef(Date.now());
  const missedIds = useRef(new Set());

  const total = pairs.words.length;

  const tryMatch = useCallback((wordId, meaningId) => {
    if (wordId === meaningId) {
      // Correct match
      setMatched((prev) => [...prev, wordId]);
      setSelectedWord(null);
      setSelectedMeaning(null);

      if (matched.length + 1 >= total) {
        const duration = Math.round((Date.now() - startTime.current) / 1000);
        onFinish({
          score: total - missedIds.current.size,
          total,
          missed: Array.from(missedIds.current),
          duration,
          testedWordIds: pairs.words.map((w) => w.id),
        });
      }
    } else {
      // Wrong match
      setWrongPair({ wordId, meaningId });
      setMistakes((prev) => prev + 1);
      missedIds.current.add(wordId);
      missedIds.current.add(meaningId);

      setTimeout(() => {
        setWrongPair(null);
        setSelectedWord(null);
        setSelectedMeaning(null);
      }, 500);
    }
  }, [matched, total, onFinish]);

  function handleWordClick(id) {
    if (matched.includes(id) || wrongPair) return;
    setSelectedWord(id);
    if (selectedMeaning !== null) {
      tryMatch(id, selectedMeaning);
    }
  }

  function handleMeaningClick(id) {
    if (matched.includes(id) || wrongPair) return;
    setSelectedMeaning(id);
    if (selectedWord !== null) {
      tryMatch(selectedWord, id);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-8 -mx-4 -mt-6">
      {/* Header */}
      <div className="hero-gradient px-6 pt-10 pb-6 rounded-b-3xl">
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
            <h1 className="text-2xl font-bold text-white">Match Pairs</h1>
            <p className="text-sm text-white/75 mt-0.5">{matched.length} of {total} matched</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${(matched.length / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5">
      <p className="text-xs text-text-secondary text-center">Tap a word, then tap its meaning</p>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* Words column */}
        <div className="flex flex-col gap-2">
          {pairs.words.map((w) => {
            const isMatched = matched.includes(w.id);
            const isSelected = selectedWord === w.id;
            const isWrong = wrongPair?.wordId === w.id;

            let style = "bg-surface-alt border-border";
            if (isMatched) style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-500";
            else if (isWrong) style = "bg-red-500/10 border-red-500/40 text-red-400 animate-shake";
            else if (isSelected) style = "bg-primary/10 border-primary text-primary";

            return (
              <button
                key={w.id}
                onClick={() => handleWordClick(w.id)}
                disabled={isMatched}
                className={`px-3 py-3 rounded-xl border text-sm font-medium text-center transition-all ${style} ${isMatched ? "opacity-60" : ""}`}
              >
                {w.text}
              </button>
            );
          })}
        </div>

        {/* Meanings column */}
        <div className="flex flex-col gap-2">
          {pairs.meanings.map((m) => {
            const isMatched = matched.includes(m.id);
            const isSelected = selectedMeaning === m.id;
            const isWrong = wrongPair?.meaningId === m.id;

            let style = "bg-surface-alt border-border";
            if (isMatched) style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-500";
            else if (isWrong) style = "bg-red-500/10 border-red-500/40 text-red-400 animate-shake";
            else if (isSelected) style = "bg-primary/10 border-primary text-primary";

            return (
              <button
                key={m.id}
                onClick={() => handleMeaningClick(m.id)}
                disabled={isMatched}
                className={`px-3 py-3 rounded-xl border text-sm text-center transition-all ${style} ${isMatched ? "opacity-60" : ""}`}
              >
                {m.text}
              </button>
            );
          })}
        </div>
      </div>

      {mistakes > 0 && (
        <p className="text-xs text-text-secondary text-center">{mistakes} mistake{mistakes !== 1 ? "s" : ""}</p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onQuit}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
        >
          Quit
        </button>
        <button
          onClick={() => {
            const testedSet = new Set([...matched, ...Array.from(missedIds.current)]);
            if (testedSet.size === 0) return;
            const duration = Math.round((Date.now() - startTime.current) / 1000);
            onFinish({
              score: matched.length,
              total: testedSet.size,
              missed: Array.from(missedIds.current),
              duration,
              testedWordIds: Array.from(testedSet),
            });
          }}
          disabled={matched.length + missedIds.current.size === 0}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Finish
        </button>
      </div>
      </div>
    </div>
  );
}
