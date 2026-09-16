"use client";

import { useEffect, useState } from "react";
import { getWords, getWordProgress } from "../../lib/data-client";
import QuizPageContent from "./QuizPageContent";
import GuestQuizPage from "./GuestQuizPage";
import { useAuth } from "../components/AuthProvider";
import { getCachedWords, isWordsFresh, setCachedWords, getCachedProgress, isProgressFresh, setCachedProgress } from "../../lib/client-cache";

const WORDS_TTL_MS = 2 * 60 * 1000;
const PROGRESS_TTL_MS = 2 * 60 * 1000;

function QuizLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="h-7 w-28 bg-white/20 rounded-lg" />
        <div className="h-4 w-56 bg-white/10 rounded mt-2" />
      </div>
      <div className="px-4 flex flex-col gap-2">
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
  const [progress, setProgress] = useState({});
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    let alive = true;
    if (loading || isGuest) return;
    const userId = user?.id;

    const cached = getCachedWords(userId);
    const fresh = cached && isWordsFresh(userId, WORDS_TTL_MS);
    if (cached) setWords(cached);
    setLoadingWords(!cached);

    const cachedProgress = getCachedProgress(userId);
    const progressFresh = cachedProgress && isProgressFresh(userId, PROGRESS_TTL_MS);
    if (cachedProgress) setProgress(cachedProgress);

    const fetchPromises = [];

    if (!fresh) {
      fetchPromises.push(
        getWords().then(({ words: w }) => {
          if (!alive) return;
          const nextWords = w || [];
          setWords(nextWords);
          setCachedWords(userId, nextWords);
          setLoadingWords(false);
        }).catch(() => {
          if (alive) setLoadingWords(false);
        })
      );
    } else {
      setLoadingWords(false);
    }

    if (!progressFresh) {
      fetchPromises.push(
        getWordProgress().then(({ progress: p }) => {
          if (!alive) return;
          const nextProgress = p || {};
          setProgress(nextProgress);
          setCachedProgress(userId, nextProgress);
        }).catch(() => {})
      );
    }

    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <QuizLoading />;
  if (isGuest) return <GuestQuizPage />;
  if (loadingWords) return <QuizLoading />;

  return <QuizPageContent words={words} isGuest={false} progress={progress} />;
}
