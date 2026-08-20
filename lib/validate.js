// Input guards for server actions.
//
// Server actions are public HTTP endpoints: their ids ship in the client
// bundle, so anything exported here can be called with arbitrary arguments
// regardless of what the UI renders. Every action must therefore treat its
// arguments as untrusted and bound them before they reach the database or
// an LLM prompt.
//
// Limits are set well above real usage (longest stored word is 34 chars,
// longest meaning 432) so they are invisible to users and only bite abuse.

export function str(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function strArray(value, { maxItems, maxLen }) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim().slice(0, maxLen);
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
    if (result.length >= maxItems) break;
  }
  return result;
}

// Same as strArray but keeps duplicates — use where repetition is meaningful.
export function strList(value, { maxItems, maxLen }) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v) => typeof v === "string")
    .map((v) => v.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function int(value, lo, hi, fallback = lo) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, Math.trunc(n)));
}

export function oneOf(value, allowed) {
  return allowed.includes(value) ? value : null;
}

// Field limits for Word and SharedWord, shared by add/update/migrate.
export const WORD_LIMITS = {
  word: 120,
  meaningEn: 1000,
  meaningBn: 1000,
  partOfSpeech: 24,
  explanation: 4000,
  example: 500,
  examples: 8,
  tag: 40,
  tags: 12,
};

// Normalize one word-shaped object from untrusted input.
// Returns null when a required field is missing.
export function sanitizeWord(input) {
  const word = str(input?.word, WORD_LIMITS.word);
  const meaningEn = str(input?.meaningEn, WORD_LIMITS.meaningEn);
  if (!word || !meaningEn) return null;

  return {
    word,
    meaningEn,
    meaningBn: str(input?.meaningBn, WORD_LIMITS.meaningBn) || null,
    partOfSpeech: str(input?.partOfSpeech, WORD_LIMITS.partOfSpeech) || null,
    explanation: str(input?.explanation, WORD_LIMITS.explanation) || null,
    examples: strList(input?.examples, { maxItems: WORD_LIMITS.examples, maxLen: WORD_LIMITS.example }),
    tags: strArray(input?.tags, { maxItems: WORD_LIMITS.tags, maxLen: WORD_LIMITS.tag }),
  };
}
