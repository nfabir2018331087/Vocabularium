"use server";

import prisma from "../../lib/prisma";

export async function addWord(formData) {
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
      },
    });
    return { success: true, id: created.id };
  } catch (err) {
    console.error("Failed to add word:", err);
    return { error: "Failed to save word. Please try again." };
  }
}

export async function getWords() {
  try {
    const words = await prisma.word.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { words };
  } catch (err) {
    console.error("Failed to fetch words:", err);
    return { words: [], error: "Failed to load words" };
  }
}

export async function getWord(id) {
  try {
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) return { error: "Word not found" };
    return { word };
  } catch (err) {
    console.error("Failed to fetch word:", err);
    return { error: "Failed to load word" };
  }
}

export async function updateWord(id, formData) {
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
    const updated = await prisma.word.update({
      where: { id },
      data: { word, meaningEn, meaningBn, partOfSpeech, explanation, examples, tags },
    });
    return { success: true, id: updated.id };
  } catch (err) {
    console.error("Failed to update word:", err);
    return { error: "Failed to update word. Please try again." };
  }
}

export async function deleteWord(id) {
  try {
    await prisma.word.delete({ where: { id } });
    return { success: true };
  } catch (err) {
    console.error("Failed to delete word:", err);
    return { error: "Failed to delete word" };
  }
}
