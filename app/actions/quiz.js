"use server";

import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";
import { chatJSON } from "../../lib/llm";
import { int, oneOf, str, strList } from "../../lib/validate";

const QUIZ_MODES = ["flashcard", "multiple_choice", "type_answer", "match_pairs"];
const MAX_QUIZ_WORDS = 500;     // 10x the largest quiz ever recorded (50)
const MAX_ID_LEN = 40;          // cuid length
const MAX_GRADE_ITEMS = MAX_QUIZ_WORDS;  // never truncate a legitimate quiz
const GRADE_BATCH_SIZE = 40;             // keep each prompt inside a safe context
const MAX_ANSWER_LEN = 300;
const MAX_DURATION = 24 * 60 * 60;

export async function saveQuizResult({ mode, score, total, missed, duration, testedWordIds }) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  // These values decide which words the weighted sampler shows next, so an
  // impossible row (score > total, unknown mode, ids that were never tested)
  // silently corrupts every future quiz. Bound and cross-check them.
  const safeMode = oneOf(mode, QUIZ_MODES);
  if (!safeMode) return { error: "Unknown quiz mode" };

  const tested = strList(testedWordIds, { maxItems: MAX_QUIZ_WORDS, maxLen: MAX_ID_LEN });
  const testedSet = new Set(tested);
  const missedIds = strList(missed, { maxItems: MAX_QUIZ_WORDS, maxLen: MAX_ID_LEN })
    .filter((id) => testedSet.has(id));

  const safeTotal = int(total, 0, MAX_QUIZ_WORDS, tested.length);
  const safeScore = int(score, 0, safeTotal, 0);
  const safeDuration = duration === null || duration === undefined
    ? null
    : int(duration, 0, MAX_DURATION, 0);

  try {
    const result = await prisma.quizResult.create({
      data: {
        mode: safeMode,
        score: safeScore,
        total: safeTotal,
        missed: missedIds,
        testedWordIds: tested,
        duration: safeDuration,
        userId,
      },
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
    // Aggregated in Postgres rather than by downloading every quiz result and
    // counting in JS — this used to grow with the user's whole quiz history.
    // Verified to produce identical output to the previous implementation.
    const rows = await prisma.$queryRaw`
      SELECT w AS id,
             count(*)::int AS tested,
             count(*) FILTER (WHERE w = ANY(q.missed))::int AS missed
      FROM "QuizResult" q, unnest(q."testedWordIds") AS w
      WHERE q."userId" = ${userId}
      GROUP BY w`;

    const stats = {};
    for (const r of rows) {
      stats[r.id] = { tested: r.tested, missed: r.missed };
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

  // Bound what reaches the prompt: an oversized batch is slow, burns quota,
  // and can exceed the model's context and fail outright.
  const safeItems = (Array.isArray(items) ? items : [])
    .filter((i) => i && i.id && i.word)
    .slice(0, MAX_GRADE_ITEMS)
    .map((i) => ({
      id: str(i.id, MAX_ID_LEN),
      word: str(i.word, 120),
      answer: str(i.answer, MAX_ANSWER_LEN),
      meaningEn: str(i.meaningEn, 1000),
      partOfSpeech: str(i.partOfSpeech, 24),
    }))
    .filter((i) => i.id && i.word);
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

  function buildUser(batch) {
    return [
      "Evaluate each item and return JSON with shape:",
      "{ results: [{ id, status, verdict, note }] }",
      "status is one of: correct, wrong, pos_mismatch",
      "verdict is a short label explaining correctness (Only these should be the verdicts: Synonym, Meaning, Related, Unrelated, Antonym, Not a word, Same as the word).",
      "note is required only for pos_mismatch (short). Should be like this: Expected a noun, but got a verb.",
      "Items:",
      JSON.stringify(batch),
    ].join("\n");
  }

  // A quiz can legitimately cover every word the user owns, so grade in
  // batches instead of one oversized prompt. Batches run concurrently (these
  // are plain fetches, not server actions, so they really do parallelize) and
  // a failed batch only loses its own items — the caller falls back to fuzzy
  // matching for anything missing.
  const batches = [];
  for (let i = 0; i < safeItems.length; i += GRADE_BATCH_SIZE) {
    batches.push(safeItems.slice(i, i + GRADE_BATCH_SIZE));
  }

  try {
    const settled = await Promise.allSettled(
      batches.map((batch) =>
        chatJSON({ system, user: buildUser(batch), temperature: 0.2 })
      )
    );

    const results = [];
    let succeeded = 0;
    for (const outcome of settled) {
      if (outcome.status !== "fulfilled") continue;
      const { parsed } = outcome.value;
      if (!parsed || !Array.isArray(parsed.results)) continue;
      succeeded++;
      results.push(...parsed.results.filter((r) => r && r.id && r.status));
    }

    if (succeeded === 0) {
      return { error: "AI grading is unavailable right now. Scores were matched locally." };
    }

    return { results };
  } catch (err) {
    console.error("Failed to grade type answers:", err);
    return { error: "AI request failed. Please try again." };
  }
}
