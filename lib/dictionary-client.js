// Guest-mode dictionary lookup. Runs entirely in the browser and calls the
// third-party API directly (CORS-enabled), unlike app/actions/dictionary.js
// which proxies through our server — that route requires sign-in specifically
// to stop unauthenticated callers from using our server as a free relay to
// the third-party API. Calling straight from the browser sidesteps that
// concern entirely: it's the guest's own IP making the request, not ours.
import { parseDictionaryApiDev, toWordData } from "./dictionary-parse";

const DICTIONARY_API_DEV_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const MAX_WORD_LEN = 80;
const TIMEOUT_MS = 4000;

export async function lookupDictionaryClient(rawWord) {
  const word = (rawWord || "").trim().slice(0, MAX_WORD_LEN);
  if (!word) return { error: "Enter a word first." };

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { error: "You're offline — dictionary lookup needs an internet connection." };
  }

  const encoded = encodeURIComponent(word.toLowerCase());
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let json = null;
  try {
    const response = await fetch(`${DICTIONARY_API_DEV_URL}/${encoded}`, {
      signal: controller.signal,
    });
    if (response.ok) json = await response.json();
  } catch {
    json = null;
  } finally {
    clearTimeout(timer);
  }

  const parsed = parseDictionaryApiDev(json, word);
  if (!parsed) {
    return { error: `No dictionary entry found for "${word}".` };
  }

  return { success: true, data: toWordData(parsed) };
}
