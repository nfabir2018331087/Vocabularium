import prisma from "./prisma";
import { getSupabaseUser } from "./supabase/server";

export async function ensureUserExists(supabaseUser) {
  if (!supabaseUser) return null;

  const existing = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { email: true, name: true, avatarUrl: true },
  });

  if (!existing) {
    return prisma.user.create({
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.full_name || null,
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
      },
    });
  }

  const nextEmail = supabaseUser.email;
  const nextName = supabaseUser.user_metadata?.full_name || null;
  const nextAvatar = supabaseUser.user_metadata?.avatar_url || null;
  const needsUpdate = existing.email !== nextEmail
    || (nextName && existing.name !== nextName)
    || (nextAvatar && existing.avatarUrl !== nextAvatar);

  if (!needsUpdate) return existing;

  return prisma.user.update({
    where: { id: supabaseUser.id },
    data: {
      email: nextEmail,
      name: nextName,
      avatarUrl: nextAvatar,
    },
  });
}

// Assign any existing words without a userId to this user
export async function claimOrphanWords(userId) {
  const result = await prisma.word.updateMany({
    where: { userId: null },
    data: { userId },
  });
  return result.count;
}

export async function getAuthenticatedUserId() {
  const user = await getSupabaseUser();
  return user?.id || null;
}

export async function getAuthenticatedUserIdWithSync() {
  const user = await getSupabaseUser();
  if (!user) return null;
  await ensureUserExists(user);
  return user.id;
}
