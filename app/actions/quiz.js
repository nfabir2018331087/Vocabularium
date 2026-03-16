"use server";

import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";

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
