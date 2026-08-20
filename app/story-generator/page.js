"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWords } from "../../lib/data-client";
import StoryGeneratorContent from "./StoryGeneratorContent";
import { useAuth } from "../components/AuthProvider";
import { getCachedWords, isWordsFresh, setCachedWords } from "../../lib/client-cache";

const WORDS_TTL_MS = 2 * 60 * 1000;

function StoryGeneratorLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="h-7 w-44 bg-white/20 rounded-lg" />
        <div className="h-4 w-56 bg-white/10 rounded mt-2" />
      </div>
      <div className="px-4 flex flex-col gap-2">
        <div className="h-40 bg-surface-alt rounded-2xl skeleton" />
        <div className="h-24 bg-surface-alt rounded-2xl skeleton" />
      </div>
    </div>
  );
}

function GuestLocked() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Story Generator</h1>
            <p className="text-sm text-white/75 mt-0.5">AI-powered vocabulary stories</p>
          </div>
        </div>
      </div>
      <div className="px-4">
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-violet-300/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-violet-300">
              <path d="M12 3l1.6 3.3L17 8l-3.4 1.7L12 13l-1.6-3.3L7 8l3.4-1.7L12 3z" />
              <path d="M5 14l.9 1.8L8 17l-2.1 1.2L5 20l-.9-1.8L2 17l2.1-1.2L5 14z" />
              <path d="M18.5 14.5l1.1 2.2L22 18l-2.4 1.3-1.1 2.2-1.1-2.2L15 18l2.4-1.3 1.1-2.2z" />
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Sign in to use the AI Story Generator</p>
          <Link href="/quiz" className="text-primary font-medium text-sm">
            Back to Quiz
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StoryGeneratorPage() {
  const { loading, isGuest, user } = useAuth();
  const [words, setWords] = useState([]);
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
      getWords().then(({ words: w }) => {
        if (!alive) return;
        const nextWords = w || [];
        setWords(nextWords);
        setCachedWords(userId, nextWords);
        setLoadingWords(false);
      });
    } else {
      setLoadingWords(false);
    }

    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <StoryGeneratorLoading />;
  if (isGuest) return <GuestLocked />;
  if (loadingWords) return <StoryGeneratorLoading />;

  return <StoryGeneratorContent words={words} userId={user?.id} />;
}
