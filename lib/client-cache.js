"use client";

const wordsCache = new Map();
const wordCache = new Map();
const progressCache = new Map();
const inboxCache = new Map();
const friendsCache = new Map();
const trackerCache = new Map();
const storiesCache = new Map();
const wordsUpdatedAt = new Map();
const progressUpdatedAt = new Map();
const inboxUpdatedAt = new Map();
const friendsUpdatedAt = new Map();
const trackerUpdatedAt = new Map();
const storiesUpdatedAt = new Map();
const META_KEY = "vocabularium.clientCache.v1";
const VERSION = 1;

// Module-memory cache of the parsed localStorage blob.
// Avoids re-parsing the JSON on every getCached*/is*Fresh call.
let _blob = undefined; // undefined = not loaded yet; null/object = loaded
let _blobLoaded = false;

function isBrowser() {
  return typeof window !== "undefined";
}

function loadPersisted() {
  if (!isBrowser()) return null;
  if (_blobLoaded) return _blob;
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) {
      _blob = null;
    } else {
      const data = JSON.parse(raw);
      _blob = data && data.version === VERSION ? data : null;
    }
  } catch {
    _blob = null;
  }
  _blobLoaded = true;
  return _blob;
}

function savePersisted(data) {
  if (!isBrowser()) return;
  _blob = data;
  _blobLoaded = true;
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
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, inboxByUser: {}, friendsByUser: {}, trackerByUser: {}, wordsUpdatedAt: {}, progressUpdatedAt: {}, inboxUpdatedAt: {}, friendsUpdatedAt: {}, trackerUpdatedAt: {} };
  base.inboxByUser[userId] = inbox || [];
  base.inboxUpdatedAt[userId] = Date.now();
  savePersisted(base);
}

function persistFriends(userId, data) {
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, inboxByUser: {}, friendsByUser: {}, trackerByUser: {}, wordsUpdatedAt: {}, progressUpdatedAt: {}, inboxUpdatedAt: {}, friendsUpdatedAt: {}, trackerUpdatedAt: {} };
  base.friendsByUser = base.friendsByUser || {};
  base.friendsUpdatedAt = base.friendsUpdatedAt || {};
  base.friendsByUser[userId] = data || { requests: [], friends: [] };
  base.friendsUpdatedAt[userId] = Date.now();
  savePersisted(base);
}

function persistTracker(userId, data) {
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, inboxByUser: {}, friendsByUser: {}, trackerByUser: {}, wordsUpdatedAt: {}, progressUpdatedAt: {}, inboxUpdatedAt: {}, friendsUpdatedAt: {}, trackerUpdatedAt: {} };
  base.trackerByUser = base.trackerByUser || {};
  base.trackerUpdatedAt = base.trackerUpdatedAt || {};
  base.trackerByUser[userId] = data || { letters: {}, tags: {} };
  base.trackerUpdatedAt[userId] = Date.now();
  savePersisted(base);
}

function persistStories(userId, data) {
  const base = loadPersisted() || { version: VERSION, wordsByUser: {}, progressByUser: {}, inboxByUser: {}, friendsByUser: {}, trackerByUser: {}, storiesByUser: {}, wordsUpdatedAt: {}, progressUpdatedAt: {}, inboxUpdatedAt: {}, friendsUpdatedAt: {}, trackerUpdatedAt: {}, storiesUpdatedAt: {} };
  base.storiesByUser = base.storiesByUser || {};
  base.storiesUpdatedAt = base.storiesUpdatedAt || {};
  base.storiesByUser[userId] = data || { stories: [], total: 0, page: 1, pageSize: 10 };
  base.storiesUpdatedAt[userId] = Date.now();
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

function readPersistedFriends(userId) {
  const data = loadPersisted();
  return data?.friendsByUser?.[userId] || null;
}

function readFriendsUpdatedAt(userId) {
  const data = loadPersisted();
  return data?.friendsUpdatedAt?.[userId] || null;
}

function readPersistedTracker(userId) {
  const data = loadPersisted();
  return data?.trackerByUser?.[userId] || null;
}

function readTrackerUpdatedAt(userId) {
  const data = loadPersisted();
  return data?.trackerUpdatedAt?.[userId] || null;
}

function readPersistedStories(userId) {
  const data = loadPersisted();
  return data?.storiesByUser?.[userId] || null;
}

function readStoriesUpdatedAt(userId) {
  const data = loadPersisted();
  return data?.storiesUpdatedAt?.[userId] || null;
}

export function getCachedWords(userId) {
  if (!userId) return null;
  if (wordsCache.has(userId)) return wordsCache.get(userId);
  const persisted = readPersistedWords(userId);
  if (persisted) {
    wordsCache.set(userId, persisted);
    const ts = readWordsUpdatedAt(userId);
    if (ts) wordsUpdatedAt.set(userId, ts);
    cacheWordsIndividually(persisted);
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
  cacheWordsIndividually(next);
}

export function getCachedWord(id) {
  if (!id) return null;
  return wordCache.get(id) || null;
}

export function setCachedWord(id, word) {
  if (!id || !word) return;
  wordCache.set(id, word);
}

// Word list responses already carry every field the detail page needs,
// so warm the per-word cache whenever a list becomes available — this is
// what lets clicking into a word from the list skip the detail fetch entirely.
function cacheWordsIndividually(words) {
  (words || []).forEach((w) => {
    if (w?.id) wordCache.set(w.id, w);
  });
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

export function getCachedFriends(userId) {
  if (!userId) return null;
  if (friendsCache.has(userId)) return friendsCache.get(userId);
  const persisted = readPersistedFriends(userId);
  if (persisted) {
    friendsCache.set(userId, persisted);
    const ts = readFriendsUpdatedAt(userId);
    if (ts) friendsUpdatedAt.set(userId, ts);
    return persisted;
  }
  return null;
}

export function setCachedFriends(userId, data) {
  if (!userId) return;
  const next = data || { requests: [], friends: [] };
  friendsCache.set(userId, next);
  friendsUpdatedAt.set(userId, Date.now());
  persistFriends(userId, next);
}

export function isFriendsFresh(userId, ttlMs) {
  if (!userId) return false;
  const ts = friendsUpdatedAt.get(userId) || readFriendsUpdatedAt(userId);
  if (!ts) return false;
  return (Date.now() - ts) < ttlMs;
}

export function getCachedTracker(userId) {
  if (!userId) return null;
  if (trackerCache.has(userId)) return trackerCache.get(userId);
  const persisted = readPersistedTracker(userId);
  if (persisted) {
    trackerCache.set(userId, persisted);
    const ts = readTrackerUpdatedAt(userId);
    if (ts) trackerUpdatedAt.set(userId, ts);
    return persisted;
  }
  return null;
}

export function setCachedTracker(userId, data) {
  if (!userId) return;
  const next = data || { letters: {}, tags: {} };
  trackerCache.set(userId, next);
  trackerUpdatedAt.set(userId, Date.now());
  persistTracker(userId, next);
}

export function isTrackerFresh(userId, ttlMs) {
  if (!userId) return false;
  const ts = trackerUpdatedAt.get(userId) || readTrackerUpdatedAt(userId);
  if (!ts) return false;
  return (Date.now() - ts) < ttlMs;
}

export function getCachedStories(userId) {
  if (!userId) return null;
  if (storiesCache.has(userId)) return storiesCache.get(userId);
  const persisted = readPersistedStories(userId);
  if (persisted) {
    storiesCache.set(userId, persisted);
    const ts = readStoriesUpdatedAt(userId);
    if (ts) storiesUpdatedAt.set(userId, ts);
    return persisted;
  }
  return null;
}

export function setCachedStories(userId, data) {
  if (!userId) return;
  const next = data || { stories: [], total: 0, page: 1, pageSize: 10 };
  storiesCache.set(userId, next);
  storiesUpdatedAt.set(userId, Date.now());
  persistStories(userId, next);
}

export function isStoriesFresh(userId, ttlMs) {
  if (!userId) return false;
  const ts = storiesUpdatedAt.get(userId) || readStoriesUpdatedAt(userId);
  if (!ts) return false;
  return (Date.now() - ts) < ttlMs;
}

export function clearUserCache(userId) {
  if (!userId) return;
  wordsCache.delete(userId);
  progressCache.delete(userId);
  inboxCache.delete(userId);
  friendsCache.delete(userId);
  trackerCache.delete(userId);
  storiesCache.delete(userId);
  wordsUpdatedAt.delete(userId);
  progressUpdatedAt.delete(userId);
  inboxUpdatedAt.delete(userId);
  friendsUpdatedAt.delete(userId);
  trackerUpdatedAt.delete(userId);
  storiesUpdatedAt.delete(userId);
  if (isBrowser()) {
    const data = loadPersisted();
    if (data?.wordsByUser) delete data.wordsByUser[userId];
    if (data?.progressByUser) delete data.progressByUser[userId];
    if (data?.inboxByUser) delete data.inboxByUser[userId];
    if (data?.friendsByUser) delete data.friendsByUser[userId];
    if (data?.trackerByUser) delete data.trackerByUser[userId];
    if (data?.storiesByUser) delete data.storiesByUser[userId];
    if (data?.wordsUpdatedAt) delete data.wordsUpdatedAt[userId];
    if (data?.progressUpdatedAt) delete data.progressUpdatedAt[userId];
    if (data?.inboxUpdatedAt) delete data.inboxUpdatedAt[userId];
    if (data?.friendsUpdatedAt) delete data.friendsUpdatedAt[userId];
    if (data?.trackerUpdatedAt) delete data.trackerUpdatedAt[userId];
    if (data?.storiesUpdatedAt) delete data.storiesUpdatedAt[userId];
    if (data) savePersisted(data);
  }
}

export function clearAllCache() {
  wordsCache.clear();
  progressCache.clear();
  inboxCache.clear();
  friendsCache.clear();
  trackerCache.clear();
  storiesCache.clear();
  _blob = null;
  _blobLoaded = true;
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(META_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}
