"use client";

import { useState, useCallback, useRef } from "react";
import ModeSelect from "./ModeSelect";
import FlashcardQuiz from "./modes/FlashcardQuiz";
import MultipleChoiceQuiz from "./modes/MultipleChoiceQuiz";
import TypeAnswerQuiz from "./modes/TypeAnswerQuiz";
import MatchPairsQuiz from "./modes/MatchPairsQuiz";
import QuizResults from "./QuizResults";
import { saveQuizResult } from "../actions/quiz";
import { saveLocalQuizResult } from "../../lib/local-quiz";
import { shuffle } from "../../lib/quiz-utils";

const MODE_COMPONENTS = {
  flashcard: FlashcardQuiz,
  multiple_choice: MultipleChoiceQuiz,
  type_answer: TypeAnswerQuiz,
  match_pairs: MatchPairsQuiz,
};

export default function QuizPageContent({ words, isGuest }) {
  const [screen, setScreen] = useState("mode_select");
  const [mode, setMode] = useState(null);
  const [wordCount, setWordCount] = useState(null);
  const [result, setResult] = useState(null);
  const sessionWordsRef = useRef(null);

  const startQuiz = useCallback((selectedMode, count) => {
    const shuffled = shuffle(words);
    // For match_pairs, count is null (handled internally)
    // For others, slice to selected count
    sessionWordsRef.current = count ? shuffled.slice(0, count) : shuffled;
    setMode(selectedMode);
    setWordCount(count);
    setScreen("session");
  }, [words]);

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
    setResult(null);
    sessionWordsRef.current = null;
  }, []);

  const retryMode = useCallback(() => {
    const shuffled = shuffle(words);
    sessionWordsRef.current = wordCount ? shuffled.slice(0, wordCount) : shuffled;
    setResult(null);
    setScreen("session");
  }, [words, wordCount]);

  if (screen === "mode_select") {
    return <ModeSelect words={words} onSelect={startQuiz} />;
  }

  if (screen === "session") {
    const QuizComponent = MODE_COMPONENTS[mode];
    return (
      <QuizComponent
        words={sessionWordsRef.current}
        allWords={words}
        onFinish={finishQuiz}
        onQuit={restart}
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
      />
    );
  }
}
