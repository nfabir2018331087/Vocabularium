"use server";

import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

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
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "Missing GROQ_API_KEY on the server." };

  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
  const safeItems = Array.isArray(items) ? items.filter((i) => i && i.id && i.word) : [];
  if (safeItems.length === 0) return { results: [] };

  const system = [
    "You are a strict but fair vocabulary grader.",
    "Return ONLY valid JSON.",
    "Mark an answer as correct if it is a direct meaning or a close synonym of the given meaning.",
    "If the answer is semantically related but the part of speech is wrong, mark status as pos_mismatch.",
    "If the answer is unrelated or incorrect, mark status as wrong.",
    "If the answer is misspelled or not a real word, mark status as wrong and set verdict to \"Not a word\".",
    "If the answer exactly matches the word itself (case-insensitive), mark status as wrong and set verdict to \"Same as the word\".",
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
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      return { error: "AI service failed. Please try again." };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJson(content);

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
