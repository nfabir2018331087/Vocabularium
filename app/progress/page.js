"use client";

import { useEffect, useState } from "react";
import { getWords } from "../actions/words";
import { getWordProgress } from "../actions/quiz";
import ProgressPageContent from "./ProgressPageContent";
import GuestProgressPage from "./GuestProgressPage";
import { useAuth } from "../components/AuthProvider";
import { getCachedProgress, getCachedWords, setCachedProgress, setCachedWords } from "../../lib/client-cache";

function ProgressLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="h-8 w-40 bg-surface-alt rounded-lg skeleton" />
      <div className="h-4 w-56 bg-surface-alt rounded skeleton" />
      <div className="flex flex-col gap-2 mt-2">
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
    if (cachedWords) setWords(cachedWords);
    if (cachedProgress) setProgress(cachedProgress);
    setLoadingData(!(cachedWords && cachedProgress));
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
    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <ProgressLoading />;
  if (isGuest) return <GuestProgressPage />;
  if (loadingData) return <ProgressLoading />;

  return <ProgressPageContent words={words} progress={progress} />;
}
