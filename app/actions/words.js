"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";
import { sanitizeWord, str, strArray, strList, WORD_LIMITS } from "../../lib/validate";

const MAX_MIGRATE_WORDS = 2000;

export async function addWord(formData) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  const word = str(formData.get("word"), WORD_LIMITS.word);
  const meaningEn = str(formData.get("meaningEn"), WORD_LIMITS.meaningEn);
  const meaningBn = str(formData.get("meaningBn"), WORD_LIMITS.meaningBn) || null;
  const partOfSpeech = str(formData.get("partOfSpeech"), WORD_LIMITS.partOfSpeech) || null;
  const explanation = str(formData.get("explanation"), WORD_LIMITS.explanation) || null;
  const examplesRaw = formData.getAll("examples");
  const tagsRaw = formData.get("tags");

  if (!word) return { error: "Word is required" };
  if (!meaningEn) return { error: "English meaning is required" };

  const duplicate = await prisma.word.findFirst({
    where: { userId, word: { equals: word, mode: "insensitive" } },
    select: { id: true },
  });
  if (duplicate) return { error: `"${word}" is already in your vocabulary` };

  const examples = strList(examplesRaw, {
    maxItems: WORD_LIMITS.examples,
    maxLen: WORD_LIMITS.example,
  });

  const tags = strArray(
    typeof tagsRaw === "string" ? tagsRaw.split(",") : [],
    { maxItems: WORD_LIMITS.tags, maxLen: WORD_LIMITS.tag }
  );

  let created;
  try {
    created = await prisma.word.create({
      data: {
        word,
        meaningEn,
        meaningBn,
        partOfSpeech,
        explanation,
        examples,
        tags,
        userId,
      },
    });
  } catch (err) {
    console.error("Failed to add word:", err);
    return { error: "Failed to save word. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/words");
  redirect(`/words/${created.id}`);
}

export async function getWords() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { words: [], error: "Not authenticated" };

  try {
    const words = await prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        word: true,
        meaningEn: true,
        meaningBn: true,
        partOfSpeech: true,
        explanation: true,
        examples: true,
        tags: true,
        createdAt: true,
      },
    });
    return { words };
  } catch (err) {
    console.error("Failed to fetch words:", err);
    return { words: [], error: "Failed to load words" };
  }
}

export async function getWord(id) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  try {
    const word = await prisma.word.findFirst({
      where: { id, userId },
    });
    if (!word) return { error: "Word not found" };
    return { word };
  } catch (err) {
    console.error("Failed to fetch word:", err);
    return { error: "Failed to load word" };
  }
}

export async function updateWord(id, formData) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  const word = str(formData.get("word"), WORD_LIMITS.word);
  const meaningEn = str(formData.get("meaningEn"), WORD_LIMITS.meaningEn);
  const meaningBn = str(formData.get("meaningBn"), WORD_LIMITS.meaningBn) || null;
  const partOfSpeech = str(formData.get("partOfSpeech"), WORD_LIMITS.partOfSpeech) || null;
  const explanation = str(formData.get("explanation"), WORD_LIMITS.explanation) || null;
  const examplesRaw = formData.getAll("examples");
  const tagsRaw = formData.get("tags");

  if (!word) return { error: "Word is required" };
  if (!meaningEn) return { error: "English meaning is required" };

  const examples = strList(examplesRaw, {
    maxItems: WORD_LIMITS.examples,
    maxLen: WORD_LIMITS.example,
  });

  const tags = strArray(
    typeof tagsRaw === "string" ? tagsRaw.split(",") : [],
    { maxItems: WORD_LIMITS.tags, maxLen: WORD_LIMITS.tag }
  );

  // Verify ownership before updating
  const existing = await prisma.word.findFirst({ where: { id, userId } });
  if (!existing) return { error: "Word not found" };

  try {
    await prisma.word.update({
      where: { id },
      data: { word, meaningEn, meaningBn, partOfSpeech, explanation, examples, tags },
    });
  } catch (err) {
    console.error("Failed to update word:", err);
    return { error: "Failed to update word. Please try again." };
  }

  revalidatePath("/");
  revalidatePath("/words");
  revalidatePath(`/words/${id}`);
  redirect(`/words/${id}`);
}

export async function deleteWord(id) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  try {
    // Verify ownership before deleting
    const existing = await prisma.word.findFirst({ where: { id, userId } });
    if (!existing) return { error: "Word not found" };

    await prisma.word.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/words");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete word:", err);
    return { error: "Failed to delete word" };
  }
}

export async function migrateLocalWords(localWords) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  const incoming = Array.isArray(localWords) ? localWords.slice(0, MAX_MIGRATE_WORDS) : [];
  if (incoming.length === 0) {
    return { success: true, migrated: 0, skipped: 0 };
  }

  try {
    // Sanitize first, then drop anything the account already has. createMany
    // does not run the duplicate check addWord does, so without this a word
    // held both in guest storage and in the account lands twice.
    const sanitized = [];
    const seen = new Set();
    for (const raw of incoming) {
      const clean = sanitizeWord(raw);
      if (!clean) continue;
      const key = clean.word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      sanitized.push(clean);
    }

    const existing = await prisma.word.findMany({
      where: { userId },
      select: { word: true },
    });
    const owned = new Set(existing.map((w) => w.word.toLowerCase()));

    const data = sanitized
      .filter((w) => !owned.has(w.word.toLowerCase()))
      .map((w) => ({ ...w, userId }));

    if (data.length > 0) {
      await prisma.word.createMany({ data });
      revalidatePath("/");
      revalidatePath("/words");
    }

    return {
      success: true,
      migrated: data.length,
      skipped: sanitized.length - data.length,
    };
  } catch (err) {
    console.error("Migration failed:", err);
    return { error: "Failed to migrate words" };
  }
}
