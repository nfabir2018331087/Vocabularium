// Shared parsing logic for dictionary API responses — used both by the
// server-side lookup (app/actions/dictionary.js, for signed-in users) and
// the client-side lookup (lib/dictionary-client.js, for guests). Kept here,
// not in either caller, since a "use server" file can't be imported by
// client-side code without turning every call into a server round-trip.

export const VALID_PARTS_OF_SPEECH = [
  "Noun",
  "Verb",
  "Adjective",
  "Adverb",
  "Pronoun",
  "Preposition",
  "Conjunction",
  "Interjection",
];

export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function stripTrailingPeriod(text) {
  return (text || "").trim().replace(/\.+\s*$/, "");
}

export function normalizePartOfSpeech(pos) {
  if (!pos) return "";
  const match = VALID_PARTS_OF_SPEECH.find(
    (p) => p.toLowerCase() === pos.trim().toLowerCase()
  );
  return match || "";
}

// Shape: { word, entries: [{ partOfSpeech, senses: [{ definition, examples: [] }] }] }
export function parseFreeDictionary(json, word) {
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
export function parseDictionaryApiDev(json, word) {
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

export function toWordData(parsed) {
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
