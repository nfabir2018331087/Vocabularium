"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ModeSelect from "./ModeSelect";
import FlashcardQuiz from "./modes/FlashcardQuiz";
import MultipleChoiceQuiz from "./modes/MultipleChoiceQuiz";
import TypeAnswerQuiz from "./modes/TypeAnswerQuiz";
import MatchPairsQuiz from "./modes/MatchPairsQuiz";
import QuizResults from "./QuizResults";
import { saveQuizResult } from "../actions/quiz";
import { saveLocalQuizResult } from "../../lib/local-quiz";
import { weightedSample } from "../../lib/quiz-utils";

const MODE_COMPONENTS = {
  flashcard: FlashcardQuiz,
  multiple_choice: MultipleChoiceQuiz,
  type_answer: TypeAnswerQuiz,
  match_pairs: MatchPairsQuiz,
};

function filterWordPool(words, filterType, filterValues) {
  if (filterType === "tags" && filterValues.length > 0) {
    return words.filter((w) => (w.tags ?? []).some((t) => filterValues.includes(t)));
  }
  if (filterType === "letters" && filterValues.length > 0) {
    return words.filter((w) => w.word?.[0] && filterValues.includes(w.word[0].toUpperCase()));
  }
  return words;
}

export default function QuizPageContent({ words, isGuest, progress = {} }) {
  const [screen, setScreen] = useState("mode_select");
  const [mode, setMode] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const [filterConfig, setFilterConfig] = useState(null);
  const [result, setResult] = useState(null);
  const sessionWordsRef = useRef(null);

  const startQuiz = useCallback((selectedMode, config) => {
    const { count, filterType, filterValues } = config;
    const pool = filterWordPool(words, filterType, filterValues);
    sessionWordsRef.current = weightedSample(pool, count, progress);
    setMode(selectedMode);
    setWordCount(count);
    setFilterConfig(config);
    setScreen("session");
  }, [words, progress]);

  const finishQuiz = useCallback(async ({ score, total, missed, duration, testedWordIds, aiGrades }) => {
    const resultData = { mode, score, total, missed, duration, testedWordIds, aiGrades };
    setResult(resultData);
    setScreen("results");

    if (isGuest) {
      saveLocalQuizResult(resultData);
    } else {
      saveQuizResult(resultData);
    }
  }, [mode, isGuest]);

  const restart = useCallback(() => {
    setScreen("mode_select");
    setMode(null);
    setWordCount(null);
    setFilterConfig(null);
    setResult(null);
    sessionWordsRef.current = null;
  }, []);

  const retryMode = useCallback(() => {
    const { count, filterType, filterValues } = filterConfig ?? {};
    const pool = filterWordPool(words, filterType ?? "random", filterValues ?? []);
    sessionWordsRef.current = weightedSample(pool, count ?? wordCount, progress);
    setResult(null);
    setScreen("session");
  }, [words, wordCount, progress, filterConfig]);

  // When entering session or results, push a history entry so the browser
  // back button returns to mode_select instead of leaving the quiz page.
  useEffect(() => {
    if (screen === "mode_select") return;

    if (screen === "session") {
      // New entry for each session start so back = mode_select
      window.history.pushState(null, "");
    }

    const handlePopState = () => {
      restart();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [screen, restart]);

  if (screen === "mode_select") {
    return <ModeSelect words={words} onSelect={startQuiz} isGuest={isGuest} />;
  }

  if (screen === "session") {
    const QuizComponent = MODE_COMPONENTS[mode];
    return (
      <QuizComponent
        words={sessionWordsRef.current}
        allWords={words}
        onFinish={finishQuiz}
        onQuit={restart}
        isGuest={isGuest}
      />
    );
  }

  if (screen === "results") {
    return (
      <QuizResults
        result={result}
        words={words}
        onRestart={restart}
        onRetry={retryMode}
        isGuest={isGuest}
      />
    );
  }
}