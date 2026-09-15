"use server";

import { getAuthenticatedUserId } from "../../lib/auth-helpers";
import { str } from "../../lib/validate";
import { parseFreeDictionary, parseDictionaryApiDev, toWordData } from "../../lib/dictionary-parse";

const MAX_WORD_LEN = 80;
const FREE_DICTIONARY_URL = "https://freedictionaryapi.com/api/v1/entries/en";
const DICTIONARY_API_DEV_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const TIMEOUT_MS = 4000;

function normalizeWord(value) {
  return (value || "").trim().toLowerCase();
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function lookupDictionary(rawWord) {
  // Public endpoint like every server action. Unauthenticated callers would
  // proxy traffic to the third-party dictionary APIs under our IP and get
  // it rate-limited for real users.
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Sign in to use Dictionary Lookup." };

  const word = str(rawWord, MAX_WORD_LEN);
  if (!word) return { error: "Enter a word first." };

  const encoded = encodeURIComponent(normalizeWord(word));

  const freeDictionaryJson = await fetchJson(`${FREE_DICTIONARY_URL}/${encoded}`);
  const parsed =
    parseFreeDictionary(freeDictionaryJson, word) ||
    parseDictionaryApiDev(await fetchJson(`${DICTIONARY_API_DEV_URL}/${encoded}`), word);

  if (!parsed) {
    return { error: `No dictionary entry found for "${word}".` };
  }

  return { success: true, data: toWordData(parsed) };
}
