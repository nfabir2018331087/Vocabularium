"use client";

const wordsCache = new Map();
const progressCache = new Map();
const META_KEY = "vocabularium.clientCache.v1";
const VERSION = 1;

function isBrowser() {
  return typeof window !== "undefined";
}

function loadPersisted() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.version !== VERSION) return null;
    return data;
  } catch {
    return null;
  }
}

function savePersisted(data) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage failures (private mode/quota)
  }
}

function persistWords(userId, words) {
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, updatedAt: {} };
  base.wordsByUser[userId] = words || [];
  savePersisted(base);
}

function persistProgress(userId, progress) {
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, updatedAt: {} };
  base.progressByUser[userId] = progress || {};
  savePersisted(base);
}

function readPersistedWords(userId) {
  const data = loadPersisted();
  return data?.wordsByUser?.[userId] || null;
}

function readPersistedProgress(userId) {
  const data = loadPersisted();
  return data?.progressByUser?.[userId] || null;
}

export function getCachedWords(userId) {
  if (!userId) return null;
  if (wordsCache.has(userId)) return wordsCache.get(userId);
  const persisted = readPersistedWords(userId);
  if (persisted) {
    wordsCache.set(userId, persisted);
    return persisted;
  }
  return null;
}

export function setCachedWords(userId, words) {
  if (!userId) return;
  const next = words || [];
  wordsCache.set(userId, next);
  persistWords(userId, next);
}

export function getCachedProgress(userId) {
  if (!userId) return null;
  if (progressCache.has(userId)) return progressCache.get(userId);
  const persisted = readPersistedProgress(userId);
  if (persisted) {
    progressCache.set(userId, persisted);
    return persisted;
  }
  return null;
}

export function setCachedProgress(userId, progress) {
  if (!userId) return;
  const next = progress || {};
  progressCache.set(userId, next);
  persistProgress(userId, next);
}

export function clearUserCache(userId) {
  if (!userId) return;
  wordsCache.delete(userId);
  progressCache.delete(userId);
  if (isBrowser()) {
    const data = loadPersisted();
    if (data?.wordsByUser) delete data.wordsByUser[userId];
    if (data?.progressByUser) delete data.progressByUser[userId];
    if (data) savePersisted(data);
  }
}

export function clearAllCache() {
  wordsCache.clear();
  progressCache.clear();
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(META_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}
