"use server";

const FREE_DICTIONARY_URL = "https://freedictionaryapi.com/api/v1/entries/en";
const DICTIONARY_API_DEV_URL = "https://api.dictionaryapi.dev/api/v2/entries/en";
const TIMEOUT_MS = 4000;

const VALID_PARTS_OF_SPEECH = [
  "Noun",
  "Verb",
  "Adjective",
  "Adverb",
  "Pronoun",
  "Preposition",
  "Conjunction",
  "Interjection",
];

function normalizeWord(value) {
  return (value || "").trim().toLowerCase();
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function stripTrailingPeriod(text) {
  return (text || "").trim().replace(/\.+\s*$/, "");
}

function normalizePartOfSpeech(pos) {
  if (!pos) return "";
  const match = VALID_PARTS_OF_SPEECH.find(
    (p) => p.toLowerCase() === pos.trim().toLowerCase()
  );
  return match || "";
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

// Shape: { word, entries: [{ partOfSpeech, senses: [{ definition, examples: [] }] }] }
function parseFreeDictionary(json, word) {
  if (!json || !Array.isArray(json.entries) || json.entries.length === 0) return null;

  const partOfSpeech = normalizePartOfSpeech(json.entries[0]?.partOfSpeech);

  const definitions = [];
  const examples = [];
  for (const entry of json.entries) {
    for (const sense of entry.senses || []) {
      if (sense.definition) definitions.push(sense.definition);
      if (Array.isArray(sense.examples)) examples.push(...sense.examples);
      if (definitions.length >= 6 && examples.length >= 3) break;
    }
  }

  if (definitions.length === 0) return null;

  return {
    word: json.word || word,
    partOfSpeech,
    definitions,
    examples: examples.slice(0, 3),
  };
}

// Shape: [{ meanings: [{ partOfSpeech, definitions: [{ definition, example }] }] }]
function parseDictionaryApiDev(json, word) {
  if (!Array.isArray(json) || json.length === 0) return null;
  const entry = json[0];
  const meanings = entry.meanings || [];
  if (meanings.length === 0) return null;

  const partOfSpeech = normalizePartOfSpeech(meanings[0]?.partOfSpeech);

  const definitions = [];
  const examples = [];
  for (const meaning of meanings) {
    for (const def of meaning.definitions || []) {
      if (def.definition) definitions.push(def.definition);
      if (def.example) examples.push(def.example);
      if (definitions.length >= 6 && examples.length >= 3) break;
    }
  }

  if (definitions.length === 0) return null;

  return {
    word: entry.word || word,
    partOfSpeech,
    definitions,
    examples: examples.slice(0, 3),
  };
}

function toWordData(parsed) {
  const meaningEn = parsed.definitions
    .slice(0, 3)
    .map((d) => capitalize(stripTrailingPeriod(d)))
    .join(", ");

  const remaining = parsed.definitions.slice(3, 5).map(capitalize);
  const explanation = remaining.join("\n\n");

  return {
    partOfSpeech: parsed.partOfSpeech,
    meaningEn,
    explanation,
    examples: parsed.examples,
  };
}

export async function lookupDictionary(rawWord) {
  const word = (rawWord || "").trim();
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
