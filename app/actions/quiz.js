"use server";

import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";
import { chatJSON } from "../../lib/llm";

export async function saveQuizResult({ mode, score, total, missed, duration, testedWordIds }) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  try {
    const result = await prisma.quizResult.create({
      data: { mode, score, total, missed, testedWordIds: testedWordIds || [], duration, userId },
    });
    return { success: true, id: result.id };
  } catch (err) {
    console.error("Failed to save quiz result:", err);
    return { error: "Failed to save result" };
  }
}

export async function getWordProgress() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { progress: {} };

  try {
    const results = await prisma.quizResult.findMany({
      where: { userId },
      select: { testedWordIds: true, missed: true },
    });

    const stats = {};
    for (const r of results) {
      for (const wid of r.testedWordIds) {
        if (!stats[wid]) stats[wid] = { tested: 0, missed: 0 };
        stats[wid].tested++;
        if (r.missed.includes(wid)) stats[wid].missed++;
      }
    }
    return { progress: stats };
  } catch (err) {
    console.error("Failed to get word progress:", err);
    return { progress: {} };
  }
}

export async function getQuizHistory() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { results: [] };

  try {
    const results = await prisma.quizResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { results };
  } catch (err) {
    console.error("Failed to fetch quiz history:", err);
    return { results: [] };
  }
}

export async function gradeTypeAnswers({ items }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Sign in to use AI grading." };

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { error: "Missing GEMINI_API_KEY / GROQ_API_KEY on the server." };
  }

  const safeItems = Array.isArray(items) ? items.filter((i) => i && i.id && i.word) : [];
  if (safeItems.length === 0) return { results: [] };

  const system = [
    "You are a strict but fair vocabulary grader. Return ONLY valid JSON.",
    "Your primary task: judge whether the answer correctly captures the MEANING of the word, not its grammar.",
    "Mark correct if the answer is the direct meaning, a synonym, or semantically equivalent to meaningEn.",
    "Mark pos_mismatch ONLY when ALL of these are true: (1) partOfSpeech is explicitly provided, (2) the answer is semantically correct, AND (3) the answer word cannot function as the same part of speech as partOfSpeech in standard English.",
    "Example of valid pos_mismatch: word is a noun meaning 'a sprint', answer is 'to run' (purely verbal form).",
    "Do NOT mark pos_mismatch when the answer word is flexible across parts of speech. Many English words serve as multiple POS — judge by the answer's PRIMARY meaning in context of meaningEn, never by a secondary meaning.",
    "Do NOT mark pos_mismatch when partOfSpeech is empty or absent.",
    "Mark wrong if the answer is semantically unrelated or incorrect.",
    "If the answer is misspelled or not a real English word, mark wrong with verdict 'Not a word'.",
    "If the answer exactly matches the word being defined (case-insensitive), mark wrong with verdict 'Same as the word'.",
    "Keep notes short (max 8 words).",
  ].join(" ");

  const user = [
    "Evaluate each item and return JSON with shape:",
    "{ results: [{ id, status, verdict, note }] }",
    "status is one of: correct, wrong, pos_mismatch",
    "verdict is a short label explaining correctness (Only these should be the verdicts: Synonym, Meaning, Related, Unrelated, Antonym, Not a word, Same as the word).",
    "note is required only for pos_mismatch (short). Should be like this: Expected a noun, but got a verb.",
    "Items:",
    JSON.stringify(safeItems),
  ].join("\n");

  try {
    const { parsed, raw } = await chatJSON({ system, user, temperature: 0.2 });

    if (!raw) {
      return { error: "AI service failed. Please try again." };
    }

    if (!parsed || !Array.isArray(parsed.results)) {
      return { error: "AI response was invalid. Please try again." };
    }

    const results = parsed.results.filter((r) => r && r.id && r.status);
    return { results };
  } catch (err) {
    console.error("Failed to grade type answers:", err);
    return { error: "AI request failed. Please try again." };
  }
}
