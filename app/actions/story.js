"use server";

import { revalidatePath } from "next/cache";
import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";
import { chatJSON } from "../../lib/llm";

const MAX_WORDS = 100;

export async function generateStory({ wordIds }) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Sign in to use the AI Story Generator." };

  const safeIds = Array.isArray(wordIds) ? [...new Set(wordIds)].slice(0, MAX_WORDS) : [];
  if (safeIds.length === 0) return { error: "Select at least one word first." };

  if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
    return { error: "Missing GEMINI_API_KEY / GROQ_API_KEY on the server." };
  }

  const words = await prisma.word.findMany({
    where: { id: { in: safeIds }, userId },
    select: { id: true, word: true, meaningEn: true, partOfSpeech: true },
  });
  if (words.length === 0) return { error: "None of the selected words could be found." };

  const targetLength = Math.round(30 + words.length * 12);

  const system = [
    "You are a whimsical micro-fiction author who writes vivid, fun short stories to help language learners remember vocabulary through context.",
    "Pick whatever genre, tone, or setting best fits the given words — surprise the reader.",
    "Every given word must appear naturally at least once, used with its given meaning and part of speech.",
    "Wrap every occurrence of a given word in double asterisks, e.g. **word**.",
    "Return ONLY valid JSON.",
  ].join(" ");

  const user = [
    `Write a short story roughly ${targetLength} words long that naturally incorporates every word below.`,
    "Words (word, meaning, part of speech):",
    words.map((w) => `- ${w.word}: ${w.meaningEn}${w.partOfSpeech ? ` (${w.partOfSpeech})` : ""}`).join("\n"),
    "Return JSON with keys:",
    "title: a short, fitting title for the story (string)",
    "content: the full story text, with every vocabulary word occurrence wrapped in **double asterisks** (string)",
  ].join("\n");

  try {
    const { parsed, raw } = await chatJSON({ system, user, temperature: 0.8 });

    if (!raw) {
      return { error: "AI service failed. Please try again." };
    }

    if (!parsed) {
      return { error: "AI response was invalid. Please try again." };
    }

    const title = (parsed.title || "").trim();
    const story = (parsed.content || "").trim();
    if (!title || !story) {
      return { error: "AI response was incomplete. Please try again." };
    }

    const created = await prisma.story.create({
      data: {
        title,
        content: story,
        wordCount: words.length,
        wordsUsed: words.map((w) => w.word),
        wordIds: words.map((w) => w.id),
        userId,
      },
    });

    revalidatePath("/story-generator");
    return { success: true, story: created };
  } catch (err) {
    console.error("Failed to generate story:", err);
    return { error: "AI request failed. Please try again." };
  }
}

export async function getStories({ page = 1, pageSize = 10 } = {}) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { stories: [], total: 0, page: 1, pageSize };

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(50, pageSize));

  try {
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
      prisma.story.count({ where: { userId } }),
    ]);
    return { stories, total, page: safePage, pageSize: safePageSize };
  } catch (err) {
    console.error("Failed to fetch stories:", err);
    return { stories: [], total: 0, page: safePage, pageSize: safePageSize };
  }
}

export async function deleteStory(id) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  try {
    const existing = await prisma.story.findFirst({ where: { id, userId } });
    if (!existing) return { error: "Story not found" };

    await prisma.story.delete({ where: { id } });
    revalidatePath("/story-generator");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete story:", err);
    return { error: "Failed to delete story" };
  }
}
