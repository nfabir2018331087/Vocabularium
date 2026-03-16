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
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onQuit}
          className="text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          Quit
        </button>
        <span className="text-sm text-text-secondary font-medium">
          {matched.length} / {total} matched
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(matched.length / total) * 100}%` }}
        />
      </div>

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
    </div>
  );
}
