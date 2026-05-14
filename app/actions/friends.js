"use server";

import { revalidatePath } from "next/cache";
import prisma from "../../lib/prisma";
import { getAuthenticatedUserId, getAuthenticatedUserIdWithSync } from "../../lib/auth-helpers";

export async function sendFriendRequest(email) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  const trimmed = (email || "").trim().toLowerCase();
  if (!trimmed) return { error: "Email is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return { error: "Invalid email address." };

  const recipient = await prisma.user.findFirst({
    where: { email: { equals: trimmed, mode: "insensitive" } },
    select: { id: true },
  });

  if (!recipient) return { error: "No user found with that email." };
  if (recipient.id === userId) return { error: "You cannot add yourself as a friend." };

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: recipient.id },
        { senderId: recipient.id, receiverId: userId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "accepted") return { error: "You are already friends." };
    if (existing.status === "pending") return { error: "A friend request is already pending." };
  }

  await prisma.friendship.create({
    data: { senderId: userId, receiverId: recipient.id },
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function acceptFriendRequest(friendshipId) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  await prisma.friendship.updateMany({
    where: { id: friendshipId, receiverId: userId, status: "pending" },
    data: { status: "accepted" },
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function removeFriend(friendshipId) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  await prisma.friendship.deleteMany({
    where: {
      id: friendshipId,
      OR: [{ senderId: userId }, { receiverId: userId }],
      status: "accepted",
    },
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function rejectFriendRequest(friendshipId) {
  const userId = await getAuthenticatedUserIdWithSync();
  if (!userId) return { error: "Not authenticated" };

  await prisma.friendship.deleteMany({
    where: { id: friendshipId, receiverId: userId, status: "pending" },
  });

  revalidatePath("/friends");
  return { success: true };
}

export async function getFriendData() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { requests: [], friends: [] };

  const [requestRows, acceptedRows] = await Promise.all([
    prisma.friendship.findMany({
      where: { receiverId: userId, status: "pending" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        sender: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId, status: "accepted" },
          { receiverId: userId, status: "accepted" },
        ],
      },
      select: {
        id: true,
        senderId: true,
        sender: {
          select: {
            id: true, name: true, email: true, avatarUrl: true,
            _count: { select: { words: true } },
          },
        },
        receiver: {
          select: {
            id: true, name: true, email: true, avatarUrl: true,
            _count: { select: { words: true } },
          },
        },
      },
    }),
  ]);

  const friends = acceptedRows.map((f) => {
    const friend = f.senderId === userId ? f.receiver : f.sender;
    return { friendshipId: f.id, ...friend };
  });

  return { requests: requestRows, friends };
}
