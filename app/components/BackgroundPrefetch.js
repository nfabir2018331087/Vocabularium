"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "./AuthProvider";
import { getWords } from "../actions/words";
import { getWordProgress } from "../actions/quiz";
import { getInbox } from "../actions/share";
import { getFriendData } from "../actions/friends";
import { getTrackerData } from "../actions/tracker";
import { getStories } from "../actions/story";
import {
  getCachedInbox, getCachedProgress, getCachedWords,
  getCachedFriends, getCachedTracker, getCachedStories,
  isInboxFresh, isProgressFresh, isWordsFresh, isFriendsFresh, isTrackerFresh, isStoriesFresh,
  setCachedInbox, setCachedProgress, setCachedWords,
  setCachedFriends, setCachedTracker, setCachedStories,
} from "../../lib/client-cache";

const PREFETCH_TTL_MS = 2 * 60 * 1000;
const STORIES_PAGE_SIZE = 10;

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
    const needsFriends = !getCachedFriends(userId) || !isFriendsFresh(userId, PREFETCH_TTL_MS);
    const needsTracker = !getCachedTracker(userId) || !isTrackerFresh(userId, PREFETCH_TTL_MS);
    const needsStories = !getCachedStories(userId) || !isStoriesFresh(userId, PREFETCH_TTL_MS);

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

    if (needsFriends) {
      getFriendData().then((data) => {
        if (data) setCachedFriends(userId, data);
      }).catch(() => {});
    }

    if (needsTracker) {
      getTrackerData().then(({ data }) => {
        if (data) setCachedTracker(userId, data);
      }).catch(() => {});
    }

    if (needsStories) {
      getStories({ page: 1, pageSize: STORIES_PAGE_SIZE }).then((result) => {
        setCachedStories(userId, { stories: result.stories || [], total: result.total || 0, page: 1, pageSize: STORIES_PAGE_SIZE });
      }).catch(() => {});
    }
  }, [loading, isGuest, user?.id]);

  return null;
}
