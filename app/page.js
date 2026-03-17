"use client";

import { useEffect, useState } from "react";
import { getWords } from "./actions/words";
import HomeContent from "./components/HomeContent";
import GuestHomeContent from "./components/GuestHomeContent";
import { useAuth } from "./components/AuthProvider";
import { getCachedWords, setCachedWords } from "../lib/client-cache";

function HomeLoading() {
  return (
    <div className="flex flex-col gap-6 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="h-8 w-48 bg-white/20 rounded-lg" />
        <div className="h-4 w-64 bg-white/10 rounded mt-2" />
        <div className="flex gap-3 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 bg-white/10 rounded-2xl h-16" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
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

  if (loading) {
    return <HomeLoading />;
  }

  if (isGuest) {
    return <GuestHomeContent />;
  }

  if (loadingWords) {
    return <HomeLoading />;
  }

  return <HomeContent words={words} />;
}
