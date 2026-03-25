"use client";

const wordsCache = new Map();
const progressCache = new Map();
const inboxCache = new Map();
const wordsUpdatedAt = new Map();
const progressUpdatedAt = new Map();
const inboxUpdatedAt = new Map();
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
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, inboxByUser: {}, wordsUpdatedAt: {}, progressUpdatedAt: {}, inboxUpdatedAt: {} };
  base.wordsByUser[userId] = words || [];
  base.wordsUpdatedAt[userId] = Date.now();
  savePersisted(base);
}

function persistProgress(userId, progress) {
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, inboxByUser: {}, wordsUpdatedAt: {}, progressUpdatedAt: {}, inboxUpdatedAt: {} };
  base.progressByUser[userId] = progress || {};
  base.progressUpdatedAt[userId] = Date.now();
  savePersisted(base);
}

function persistInbox(userId, inbox) {
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, inboxByUser: {}, wordsUpdatedAt: {}, progressUpdatedAt: {}, inboxUpdatedAt: {} };
  base.inboxByUser[userId] = inbox || [];
  base.inboxUpdatedAt[userId] = Date.now();
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

function readPersistedInbox(userId) {
  const data = loadPersisted();
  return data?.inboxByUser?.[userId] || null;
}

function readWordsUpdatedAt(userId) {
  const data = loadPersisted();
  return data?.wordsUpdatedAt?.[userId] || null;
}

function readProgressUpdatedAt(userId) {
  const data = loadPersisted();
  return data?.progressUpdatedAt?.[userId] || null;
}

function readInboxUpdatedAt(userId) {
  const data = loadPersisted();
  return data?.inboxUpdatedAt?.[userId] || null;
}

export function getCachedWords(userId) {
  if (!userId) return null;
  if (wordsCache.has(userId)) return wordsCache.get(userId);
  const persisted = readPersistedWords(userId);
  if (persisted) {
    wordsCache.set(userId, persisted);
    const ts = readWordsUpdatedAt(userId);
    if (ts) wordsUpdatedAt.set(userId, ts);
    return persisted;
  }
  return null;
}

export function setCachedWords(userId, words) {
  if (!userId) return;
  const next = words || [];
  wordsCache.set(userId, next);
  wordsUpdatedAt.set(userId, Date.now());
  persistWords(userId, next);
}

export function getCachedProgress(userId) {
  if (!userId) return null;
  if (progressCache.has(userId)) return progressCache.get(userId);
  const persisted = readPersistedProgress(userId);
  if (persisted) {
    progressCache.set(userId, persisted);
    const ts = readProgressUpdatedAt(userId);
    if (ts) progressUpdatedAt.set(userId, ts);
    return persisted;
  }
  return null;
}

export function setCachedProgress(userId, progress) {
  if (!userId) return;
  const next = progress || {};
  progressCache.set(userId, next);
  progressUpdatedAt.set(userId, Date.now());
  persistProgress(userId, next);
}

export function getCachedInbox(userId) {
  if (!userId) return null;
  if (inboxCache.has(userId)) return inboxCache.get(userId);
  const persisted = readPersistedInbox(userId);
  if (persisted) {
    inboxCache.set(userId, persisted);
    const ts = readInboxUpdatedAt(userId);
    if (ts) inboxUpdatedAt.set(userId, ts);
    return persisted;
  }
  return null;
}

export function setCachedInbox(userId, inbox) {
  if (!userId) return;
  const next = inbox || [];
  inboxCache.set(userId, next);
  inboxUpdatedAt.set(userId, Date.now());
  persistInbox(userId, next);
}

export function isWordsFresh(userId, ttlMs) {
  if (!userId) return false;
  const ts = wordsUpdatedAt.get(userId) || readWordsUpdatedAt(userId);
  if (!ts) return false;
  return (Date.now() - ts) < ttlMs;
}

export function isProgressFresh(userId, ttlMs) {
  if (!userId) return false;
  const ts = progressUpdatedAt.get(userId) || readProgressUpdatedAt(userId);
  if (!ts) return false;
  return (Date.now() - ts) < ttlMs;
}

export function isInboxFresh(userId, ttlMs) {
  if (!userId) return false;
  const ts = inboxUpdatedAt.get(userId) || readInboxUpdatedAt(userId);
  if (!ts) return false;
  return (Date.now() - ts) < ttlMs;
}

export function clearUserCache(userId) {
  if (!userId) return;
  wordsCache.delete(userId);
  progressCache.delete(userId);
  inboxCache.delete(userId);
  wordsUpdatedAt.delete(userId);
  progressUpdatedAt.delete(userId);
  inboxUpdatedAt.delete(userId);
  if (isBrowser()) {
    const data = loadPersisted();
    if (data?.wordsByUser) delete data.wordsByUser[userId];
    if (data?.progressByUser) delete data.progressByUser[userId];
    if (data?.inboxByUser) delete data.inboxByUser[userId];
    if (data?.wordsUpdatedAt) delete data.wordsUpdatedAt[userId];
    if (data?.progressUpdatedAt) delete data.progressUpdatedAt[userId];
    if (data?.inboxUpdatedAt) delete data.inboxUpdatedAt[userId];
    if (data) savePersisted(data);
  }
}

export function clearAllCache() {
  wordsCache.clear();
  progressCache.clear();
  inboxCache.clear();
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(META_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}
