"use server";

import { revalidatePath } from "next/cache";
import prisma from "../../lib/prisma";
import { getSupabaseServer } from "../../lib/supabase/server";
import { ensureUserExists, claimOrphanWords } from "../../lib/auth-helpers";

async function getAuthenticatedUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  await ensureUserExists(user);
  return user.id;
}

export async function addWord(formData) {
  const userId = await getAuthenticatedUser();
  if (!userId) return { error: "Not authenticated" };

  const word = formData.get("word")?.trim();
  const meaningEn = formData.get("meaningEn")?.trim();
  const meaningBn = formData.get("meaningBn")?.trim() || null;
  const partOfSpeech = formData.get("partOfSpeech")?.trim() || null;
  const explanation = formData.get("explanation")?.trim() || null;
  const examplesRaw = formData.getAll("examples");
  const tagsRaw = formData.get("tags")?.trim();

  if (!word) return { error: "Word is required" };
  if (!meaningEn) return { error: "English meaning is required" };

  const examples = examplesRaw
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  try {
    const created = await prisma.word.create({
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

    // Also add to global word bank
    await prisma.globalWord.create({
      data: {
        word,
        meaningEn,
        meaningBn,
        partOfSpeech,
        explanation,
        examples,
        tags,
        contributedBy: userId,
      },
    }).catch(() => {}); // non-critical, don't fail the main operation

    revalidatePath("/");
    revalidatePath("/words");
    return { success: true, id: created.id };
  } catch (err) {
    console.error("Failed to add word:", err);
    return { error: "Failed to save word. Please try again." };
  }
}

export async function getWords() {
  const userId = await getAuthenticatedUser();
  if (!userId) return { words: [], error: "Not authenticated" };

  try {
    const words = await prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { words };
  } catch (err) {
    console.error("Failed to fetch words:", err);
    return { words: [], error: "Failed to load words" };
  }
}

export async function getWord(id) {
  const userId = await getAuthenticatedUser();
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
  const userId = await getAuthenticatedUser();
  if (!userId) return { error: "Not authenticated" };

  const word = formData.get("word")?.trim();
  const meaningEn = formData.get("meaningEn")?.trim();
  const meaningBn = formData.get("meaningBn")?.trim() || null;
  const partOfSpeech = formData.get("partOfSpeech")?.trim() || null;
  const explanation = formData.get("explanation")?.trim() || null;
  const examplesRaw = formData.getAll("examples");
  const tagsRaw = formData.get("tags")?.trim();

  if (!word) return { error: "Word is required" };
  if (!meaningEn) return { error: "English meaning is required" };

  const examples = examplesRaw
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  try {
    // Verify ownership before updating
    const existing = await prisma.word.findFirst({ where: { id, userId } });
    if (!existing) return { error: "Word not found" };

    const updated = await prisma.word.update({
      where: { id },
      data: { word, meaningEn, meaningBn, partOfSpeech, explanation, examples, tags },
    });
    revalidatePath("/");
    revalidatePath("/words");
    revalidatePath(`/words/${id}`);
    return { success: true, id: updated.id };
  } catch (err) {
    console.error("Failed to update word:", err);
    return { error: "Failed to update word. Please try again." };
  }
}

export async function deleteWord(id) {
  const userId = await getAuthenticatedUser();
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
  const userId = await getAuthenticatedUser();
  if (!userId) return { error: "Not authenticated" };

  // First, claim any orphan words (existing DB words without userId)
  const claimed = await claimOrphanWords(userId);

  if (!localWords || localWords.length === 0) {
    return { success: true, migrated: 0, claimed };
  }

  try {
    const data = localWords.map((w) => ({
      word: w.word,
      meaningEn: w.meaningEn,
      meaningBn: w.meaningBn || null,
      partOfSpeech: w.partOfSpeech || null,
      explanation: w.explanation || null,
      examples: w.examples || [],
      tags: w.tags || [],
      userId,
    }));

    await prisma.word.createMany({ data });

    // Also bulk-add to global word bank
    await prisma.globalWord.createMany({
      data: data.map((d) => ({
        word: d.word,
        meaningEn: d.meaningEn,
        meaningBn: d.meaningBn,
        partOfSpeech: d.partOfSpeech,
        explanation: d.explanation,
        examples: d.examples,
        tags: d.tags,
        contributedBy: userId,
      })),
    }).catch(() => {});

    revalidatePath("/");
    revalidatePath("/words");
    return { success: true, migrated: localWords.length, claimed };
  } catch (err) {
    console.error("Migration failed:", err);
    return { error: "Failed to migrate words" };
  }
}
