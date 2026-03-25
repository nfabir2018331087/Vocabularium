"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { getWords } from "../actions/words";
import { getWordProgress } from "../actions/quiz";
import { getInbox } from "../actions/share";
import { getCachedInbox, getCachedProgress, getCachedWords, isInboxFresh, isProgressFresh, isWordsFresh, setCachedInbox, setCachedProgress, setCachedWords } from "../../lib/client-cache";

const PREFETCH_TTL_MS = 2 * 60 * 1000;

export default function BackgroundPrefetch() {
  const { loading, isGuest, user } = useAuth();
  const startedRef = useRef(false);

  useEffect(() => {
    if (loading || isGuest || !user?.id) return;
    if (startedRef.current) return;
    startedRef.current = true;

    const userId = user.id;

    const needsWords = !getCachedWords(userId) || !isWordsFresh(userId, PREFETCH_TTL_MS);
    const needsProgress = !getCachedProgress(userId) || !isProgressFresh(userId, PREFETCH_TTL_MS);
    const needsInbox = !getCachedInbox(userId) || !isInboxFresh(userId, PREFETCH_TTL_MS);

    if (needsWords) {
      getWords().then(({ words }) => {
        if (words) setCachedWords(userId, words);
      }).catch(() => {});
    }

    if (needsProgress) {
      getWordProgress().then(({ progress }) => {
        if (progress) setCachedProgress(userId, progress);
      }).catch(() => {});
    }

    if (needsInbox) {
      getInbox().then(({ inbox }) => {
        if (inbox) setCachedInbox(userId, inbox);
      }).catch(() => {});
    }
  }, [loading, isGuest, user?.id]);

  return null;
}
