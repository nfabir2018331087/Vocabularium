"use server";

import { revalidatePath } from "next/cache";
import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";

const MAX_INBOX = 200;

export async function shareWord({ wordId, recipientEmail }) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  const email = (recipientEmail || "").trim().toLowerCase();
  if (!email) return { error: "Recipient email is required" };

  const recipient = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });

  if (!recipient) return { error: "No user found with that email." };
  if (recipient.id === userId) return { error: "You cannot share a word with yourself." };

  const word = await prisma.word.findFirst({
    where: { id: wordId, userId },
  });

  if (!word) return { error: "Word not found" };

  try {
    await prisma.sharedWord.create({
      data: {
        word: word.word,
        meaningEn: word.meaningEn,
        meaningBn: word.meaningBn,
        partOfSpeech: word.partOfSpeech,
        explanation: word.explanation,
        examples: word.examples,
        tags: word.tags,
        senderId: userId,
        recipientId: recipient.id,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to share word:", err);
    return { error: "Failed to share word. Please try again." };
  }
}

export async function getInbox() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { inbox: [], unread: 0 };

  try {
    const inbox = await prisma.sharedWord.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: MAX_INBOX,
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
        isNew: true,
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    const unread = inbox.filter((i) => i.isNew).length;
    return { inbox, unread };
  } catch (err) {
    console.error("Failed to load inbox:", err);
    return { inbox: [], unread: 0 };
  }
}

export async function markSharedWordSeen(id) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  try {
    await prisma.sharedWord.updateMany({
      where: { id, recipientId: userId, isNew: true },
      data: { isNew: false },
    });
    return { success: true };
  } catch (err) {
    console.error("Failed to mark shared word seen:", err);
    return { error: "Failed to update inbox." };
  }
}

export async function acceptSharedWord(id) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  try {
    const shared = await prisma.sharedWord.findFirst({
      where: { id, recipientId: userId },
    });
    if (!shared) return { error: "Shared word not found" };

    await prisma.$transaction([
      prisma.word.create({
        data: {
          word: shared.word,
          meaningEn: shared.meaningEn,
          meaningBn: shared.meaningBn,
          partOfSpeech: shared.partOfSpeech,
          explanation: shared.explanation,
          examples: shared.examples,
          tags: shared.tags,
          userId,
        },
      }),
      prisma.sharedWord.delete({ where: { id: shared.id } }),
    ]);

    revalidatePath("/");
    revalidatePath("/words");
    return { success: true };
  } catch (err) {
    console.error("Failed to accept shared word:", err);
    return { error: "Failed to save shared word." };
  }
}

export async function removeSharedWord(id) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  try {
    await prisma.sharedWord.deleteMany({
      where: { id, recipientId: userId },
    });
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Failed to remove shared word:", err);
    return { error: "Failed to remove shared word." };
  }
}
