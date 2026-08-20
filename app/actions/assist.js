"use server";

import { chatJSON } from "../../lib/llm";
import { getAuthenticatedUserId } from "../../lib/auth-helpers";
import { str } from "../../lib/validate";

const MAX_WORD_LEN = 80;

function normalizeWord(value) {
  return (value || "").trim().toLowerCase();
}

export async function assistWord(rawWord) {
  // Server actions are public endpoints — the UI hides this button from
  // guests, but that does not stop a direct POST. Without this check the
  // app's AI quota is spendable by anyone.
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Sign in to use AI Assist." };

  const word = str(rawWord, MAX_WORD_LEN);
  if (!word) return { error: "Enter a word first." };

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { error: "Missing GEMINI_API_KEY / GROQ_API_KEY on the server." };
  }

  const system = [
    "You are a careful dictionary assistant.",
    "Return ONLY valid JSON.",
    "If the word is misspelled, not a real word, or you are unsure, set status to \"not_found\" and include an error message.",
    "Do not hallucinate meanings.",
  ].join(" ");

  const user = [
    `Word: "${word}"`,
    "Return JSON with keys:",
    "status: \"ok\" or \"not_found\"",
    "word: corrected or normalized word (string)",
    "meaningEn: English meaning (string) upto 3, comma separated, capitalized first letter, and can't be empty",
    "meaningBn: Bangla meaning upto 3 comma separated or empty string",
    "partOfSpeech: one of Noun, Verb, Adjective, Adverb, Pronoun, Preposition, Conjunction, Interjection, or empty string",
    "explanation: brief explanation or empty string",
    "examples: array of 1-2 example sentences or empty array",
    "tags: array of 0-1 short tag to define broad category of the word with capitalized first letters or empty array",
    "error: error message if status is not_found",
  ].join("\n");

  try {
    const { parsed, raw } = await chatJSON({ system, user, temperature: 0.2 });

    if (!raw) {
      return { error: "AI service failed. Please try again." };
    }

    if (!parsed) {
      return { error: "AI response was invalid. Please try again." };
    }

    if (parsed.status !== "ok") {
      return { error: parsed.error || "No reliable meaning found. Check spelling and try again." };
    }

    const meaningEn = (parsed.meaningEn || "").trim();
    if (!meaningEn) {
      return { error: "No reliable meaning found. Check spelling and try again." };
    }

    const returnedWord = (parsed.word || word).trim();
    if (normalizeWord(returnedWord) !== normalizeWord(word)) {
      return { error: "The word may be misspelled. Please check and try again." };
    }

    const examples = Array.isArray(parsed.examples) ? parsed.examples.filter(Boolean).slice(0, 3) : [];
    const tags = Array.isArray(parsed.tags) ? parsed.tags.filter(Boolean).slice(0, 5) : [];

    return {
      success: true,
      data: {
        word: returnedWord,
        meaningEn,
        meaningBn: (parsed.meaningBn || "").trim(),
        partOfSpeech: (parsed.partOfSpeech || "").trim(),
        explanation: (parsed.explanation || "").trim(),
        examples,
        tags,
      },
    };
  } catch {
    return { error: "AI request failed. Please try again." };
  }
}
