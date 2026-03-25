"use client";

import { useMemo, useRef, useState } from "react";
import { gradeTypeAnswers } from "../../actions/quiz";
import { fuzzyMatch } from "../../../lib/quiz-utils";

export default function TypeAnswerQuiz({ words, onFinish, onQuit }) {
  const quizWords = words;
  const total = quizWords.length;
  const wordMap = useMemo(() => {
    const map = new Map();
    for (const w of quizWords) map.set(w.id, w);
    return map;
  }, [quizWords]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [input, setInput] = useState("");
  const [grading, setGrading] = useState(false);
  const startTime = useRef(Date.now());
  const inputRef = useRef(null);

  const current = quizWords[index];
  const progress = (index / total) * 100;

  async function handleFinish(answersToGrade) {
    if (grading) return;
    setGrading(true);
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const testedWordIds = answersToGrade.map((a) => a.wordId);
    const items = answersToGrade.map((a) => {
      const word = wordMap.get(a.wordId);
      return {
        id: a.wordId,
        word: word?.word || "",
        meaningEn: word?.meaningEn || "",
        partOfSpeech: word?.partOfSpeech || "",
        answer: a.answer,
      };
    });

    const ai = await gradeTypeAnswers({ items });
    let resultsById = new Map();
    if (ai?.results?.length) {
      for (const r of ai.results) {
        resultsById.set(r.id, r);
      }
    }

    const graded = answersToGrade.map((a) => {
      const word = wordMap.get(a.wordId);
      const aiResult = resultsById.get(a.wordId);
      let status = aiResult?.status;
      let note = aiResult?.note || "";
      let verdict = aiResult?.verdict || "";
      if (!status) {
        status = fuzzyMatch(a.answer, word?.meaningEn || "") ? "correct" : "wrong";
      }
      const normalizedAnswer = (a.answer || "").trim().toLowerCase();
      const normalizedWord = (word?.word || "").trim().toLowerCase();
      if (normalizedAnswer && normalizedWord && normalizedAnswer === normalizedWord) {
        status = "wrong";
        verdict = "Same as the word";
      }
      return {
        id: a.wordId,
        word: word?.word || "",
        meaningEn: word?.meaningEn || "",
        partOfSpeech: word?.partOfSpeech || "",
        answer: a.answer,
        status,
        note,
        verdict,
      };
    });

    const score = graded.filter((g) => g.status === "correct").length;
    const missed = graded.filter((g) => g.status !== "correct").map((g) => g.id);

    onFinish({
      score,
      total: testedWordIds.length,
      missed,
      duration,
      testedWordIds,
      aiGrades: graded,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || grading) return;

    const nextAnswers = [...answers, { wordId: current.id, answer: trimmed }];
    setAnswers(nextAnswers);

    if (index + 1 >= total) {
      handleFinish(nextAnswers);
      return;
    }

    setIndex((prev) => prev + 1);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onQuit}
          disabled={grading}
          className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
          disabled={grading}
          autoFocus
          placeholder="Your answer..."
          className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-colors text-text placeholder:text-text-secondary/50 ${
            grading
              ? "bg-surface-alt/70 border-border"
              : "bg-surface-alt border-border focus:border-primary"
          }`}
        />

        <button
          type="submit"
          disabled={!input.trim() || grading}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          {grading ? "Grading with AI..." : (index + 1 >= total ? "See Results" : "Next")}
        </button>
      </form>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          onClick={onQuit}
          disabled={grading}
          className="px-4 py-2 rounded-xl bg-surface-alt border border-border text-sm font-semibold text-text-secondary hover:text-text hover:border-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Quit
        </button>
        <button
          onClick={() => {
            if (answers.length === 0 || grading) return;
            handleFinish(answers);
          }}
          disabled={answers.length === 0 || grading}
          className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {grading ? "Grading with AI..." : "Finish"}
        </button>
      </div>
    </div>
  );
}
