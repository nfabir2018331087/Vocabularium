"use client";

// In-flight request coalescing for the shared reads.
//
// Next.js runs client-initiated Server Actions through a single queue, one at
// a time (see client/app-call-server.js -> the action queue in
// app-router-instance.js). So two components asking for the same data on the
// same render do not merely duplicate a request — the second one waits for the
// first to finish before it even starts, and every later action queues behind
// both.
//
// The home page and BackgroundPrefetch both mount on load and both ask for
// words, progress, and inbox, which put three redundant round trips at the
// front of that queue. Routing every caller through here collapses concurrent
// duplicates into one shared promise.
//
// This only dedupes calls that overlap in time; lib/client-cache.js still owns
// the longer-lived TTL cache.

import { getWords as getWordsAction } from "../app/actions/words";
import { getWordProgress as getWordProgressAction } from "../app/actions/quiz";
import { getInbox as getInboxAction } from "../app/actions/share";
import { getFriendData as getFriendDataAction } from "../app/actions/friends";
import { getTrackerData as getTrackerDataAction } from "../app/actions/tracker";
import { getStories as getStoriesAction } from "../app/actions/story";

const inflight = new Map();

function once(key, run) {
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = Promise.resolve().then(run);
  inflight.set(key, promise);

  const clear = () => {
    if (inflight.get(key) === promise) inflight.delete(key);
  };
  promise.then(clear, clear);

  return promise;
}

export function getWords() {
  return once("words", getWordsAction);
}

export function getWordProgress() {
  return once("progress", getWordProgressAction);
}

export function getInbox() {
  return once("inbox", getInboxAction);
}

export function getFriendData() {
  return once("friends", getFriendDataAction);
}

export function getTrackerData() {
  return once("tracker", getTrackerDataAction);
}

export function getStories(params = {}) {
  const { page = 1, pageSize = 10 } = params;
  return once(`stories:${page}:${pageSize}`, () => getStoriesAction({ page, pageSize }));
}

// Called on sign-out / user switch so a pending request from the previous
// session can never resolve into the next one's cache.
export function resetInflight() {
  inflight.clear();
}
