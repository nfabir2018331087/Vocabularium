"use client";

import { useEffect, useState } from "react";
import { getWords } from "../actions/words";
import WordsPageContent from "./WordsPageContent";
import GuestWordsPage from "./GuestWordsPage";
import { useAuth } from "../components/AuthProvider";
import { getCachedWords, setCachedWords } from "../../lib/client-cache";

function WordsLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="h-8 w-32 bg-surface-alt rounded-lg skeleton" />
      <div className="h-10 bg-surface-alt rounded-xl skeleton" />
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-alt rounded-xl skeleton" />
        ))}
      </div>
    </div>
  );
}

export default function Words() {
  const { loading, isGuest, user } = useAuth();
  const [words, setWords] = useState([]);
  const [error, setError] = useState(null);
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
    getWords().then(({ words: w, error: err }) => {
      if (!alive) return;
      const nextWords = w || [];
      setWords(nextWords);
      setCachedWords(userId, nextWords);
      setError(err || null);
      setLoadingWords(false);
    });
    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <WordsLoading />;
  if (isGuest) return <GuestWordsPage />;
  if (loadingWords) return <WordsLoading />;

  return <WordsPageContent words={words} error={error} />;
}
