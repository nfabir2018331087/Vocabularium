"use client";

import { useEffect, useState } from "react";
import { getWords, getInbox, getWordProgress } from "../lib/data-client";
import HomeContent from "./components/HomeContent";
import GuestHomeContent from "./components/GuestHomeContent";
import { useAuth } from "./components/AuthProvider";
import { getCachedInbox, getCachedProgress, getCachedWords, isInboxFresh, isProgressFresh, isWordsFresh, setCachedInbox, setCachedProgress, setCachedWords } from "../lib/client-cache";

const WORDS_TTL_MS = 2 * 60 * 1000;
const PROGRESS_TTL_MS = 2 * 60 * 1000;
const INBOX_TTL_MS = 2 * 60 * 1000;

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
  const [progress, setProgress] = useState({});
  const [inbox, setInbox] = useState(null);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [loadingWords, setLoadingWords] = useState(false);

  useEffect(() => {
    let alive = true;
    if (loading || isGuest) return;
    const userId = user?.id;
    const cached = getCachedWords(userId);
    const cachedProgress = getCachedProgress(userId);
    const cachedInbox = getCachedInbox(userId);
    const fresh = cached && isWordsFresh(userId, WORDS_TTL_MS);
    const progressFresh = cachedProgress && isProgressFresh(userId, PROGRESS_TTL_MS);
    const inboxFresh = cachedInbox && isInboxFresh(userId, INBOX_TTL_MS);
    const shouldFetchInbox = !inboxFresh || (Array.isArray(cachedInbox) && cachedInbox.length === 0);
    if (cached) setWords(cached);
    if (cachedProgress) setProgress(cachedProgress);
    if (cachedInbox) {
      setInbox(cachedInbox);
      setInboxUnread(cachedInbox.filter((i) => i.isNew).length);
    }
    setLoadingWords(!cached);
    if (!fresh) {
      getWords().then(({ words: w }) => {
        if (!alive) return;
        const nextWords = w || [];
        setWords(nextWords);
        setCachedWords(userId, nextWords);
        setLoadingWords(false);
      }).catch(() => {
        if (alive) setLoadingWords(false);
      });
    } else {
      setLoadingWords(false);
    }
    if (!progressFresh) {
      getWordProgress().then(({ progress: p }) => {
        if (!alive) return;
        const nextProgress = p || {};
        setProgress(nextProgress);
        setCachedProgress(userId, nextProgress);
      }).catch(() => {});
    }
    if (shouldFetchInbox) {
      getInbox().then(({ inbox: items, unread }) => {
        if (!alive) return;
        const nextInbox = items || [];
        setInbox(nextInbox);
        setInboxUnread(unread || 0);
        setCachedInbox(userId, nextInbox);
      }).catch(() => {});
    }
    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) {
    return <HomeLoading />;
  }

  if (isGuest) {
    return <GuestHomeContent />;
  }

  // Render the static UI immediately. Inline shimmers handle the dynamic
  // bits (stats, recent words) when no cache exists yet.
  return (
    <HomeContent
      words={words}
      progress={progress}
      inbox={inbox}
      inboxUnread={inboxUnread}
      onWordsRefresh={setWords}
      loading={loadingWords}
    />
  );
}
