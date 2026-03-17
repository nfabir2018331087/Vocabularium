"use client";

import { useEffect, useState } from "react";
import { getWords } from "../actions/words";
import QuizPageContent from "./QuizPageContent";
import GuestQuizPage from "./GuestQuizPage";
import { useAuth } from "../components/AuthProvider";
import { getCachedWords, setCachedWords } from "../../lib/client-cache";

function QuizLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="h-8 w-32 bg-surface-alt rounded-lg skeleton" />
      <div className="h-4 w-48 bg-surface-alt rounded skeleton" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-surface-alt rounded-2xl skeleton" />
        ))}
      </div>
    </div>
  );
}

export default function QuizPage() {
  const { loading, isGuest, user } = useAuth();
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    let alive = true;
    if (loading || isGuest) return;
    const userId = user?.id;
    const cached = getCachedWords(userId);
    if (cached) {
      setWords(cached);
      setLoadingWords(false);
    } else {
      setLoadingWords(true);
    }
    getWords().then(({ words: w }) => {
      if (!alive) return;
      const nextWords = w || [];
      setWords(nextWords);
      setCachedWords(userId, nextWords);
      setLoadingWords(false);
    });
    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <QuizLoading />;
  if (isGuest) return <GuestQuizPage />;
  if (loadingWords) return <QuizLoading />;

  return <QuizPageContent words={words} isGuest={false} />;
}
