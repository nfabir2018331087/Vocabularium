"use client";

import { useEffect, useState, Suspense } from "react";
import { getWords, getWordProgress } from "../../lib/data-client";
import ProgressPageContent from "./ProgressPageContent";
import GuestProgressPage from "./GuestProgressPage";
import { useAuth } from "../components/AuthProvider";
import { getCachedProgress, getCachedWords, isProgressFresh, isWordsFresh, setCachedProgress, setCachedWords } from "../../lib/client-cache";

const WORDS_TTL_MS = 2 * 60 * 1000;
const PROGRESS_TTL_MS = 2 * 60 * 1000;

function ProgressLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="h-7 w-32 bg-white/20 rounded-lg" />
        <div className="h-4 w-56 bg-white/10 rounded mt-2" />
        <div className="h-16 bg-white/15 rounded-2xl mt-4" />
      </div>
      <div className="px-4 flex flex-col gap-2 mt-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-surface-alt rounded-xl skeleton" />
        ))}
      </div>
    </div>
  );
}

export default function Progress() {
  const { loading, isGuest, user } = useAuth();
  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    let alive = true;
    if (loading || isGuest) return;
    const userId = user?.id;
    const cachedWords = getCachedWords(userId);
    const cachedProgress = getCachedProgress(userId);
    const wordsFresh = cachedWords && isWordsFresh(userId, WORDS_TTL_MS);
    const progressFresh = cachedProgress && isProgressFresh(userId, PROGRESS_TTL_MS);

    if (cachedWords) setWords(cachedWords);
    if (cachedProgress) setProgress(cachedProgress);
    setLoadingData(!(cachedWords && cachedProgress));

    if (!wordsFresh || !progressFresh) {
      Promise.all([getWords(), getWordProgress()]).then(([w, p]) => {
        if (!alive) return;
        const nextWords = w.words || [];
        const nextProgress = p.progress || {};
        setWords(nextWords);
        setProgress(nextProgress);
        setCachedWords(userId, nextWords);
        setCachedProgress(userId, nextProgress);
        setLoadingData(false);
      });
    } else {
      setLoadingData(false);
    }
    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <ProgressLoading />;
  if (isGuest) return <GuestProgressPage />;
  if (loadingData) return <ProgressLoading />;

  return (
    <Suspense fallback={<ProgressLoading />}>
      <ProgressPageContent words={words} progress={progress} />
    </Suspense>
  );
}