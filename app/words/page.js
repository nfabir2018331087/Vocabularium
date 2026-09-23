"use client";

import { useEffect, useState, Suspense } from "react";
import { getWords } from "../../lib/data-client";
import WordsPageContent from "./WordsPageContent";
import GuestWordsPage from "./GuestWordsPage";
import { useAuth } from "../components/AuthProvider";
import { getCachedWords, isWordsFresh, setCachedWords } from "../../lib/client-cache";

const WORDS_TTL_MS = 2 * 60 * 1000;

function WordsLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="h-7 w-28 bg-white/20 rounded-lg" />
        <div className="h-4 w-48 bg-white/10 rounded mt-2" />
        <div className="h-10 bg-white/15 rounded-xl mt-4" />
      </div>
      <div className="px-4 flex flex-col gap-2">
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
    const fresh = cached && isWordsFresh(userId, WORDS_TTL_MS);
    if (cached) setWords(cached);
    setLoadingWords(!cached);
    if (!fresh) {
      getWords().then(({ words: w, error: err }) => {
        if (!alive) return;
        const nextWords = w || [];
        setWords(nextWords);
        setCachedWords(userId, nextWords);
        setError(err || null);
        setLoadingWords(false);
      });
    } else {
      setLoadingWords(false);
    }
    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <WordsLoading />;
  if (isGuest) return <GuestWordsPage />;
  if (loadingWords) return <WordsLoading />;

  return (
    <Suspense fallback={<WordsLoading />}>
      <WordsPageContent words={words} error={error} />
    </Suspense>
  );
}
