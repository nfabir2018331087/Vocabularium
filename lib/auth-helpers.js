import prisma from "./prisma";

export async function ensureUserExists(supabaseUser) {
  if (!supabaseUser) return null;

  const existing = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });

  if (existing) return existing;

  return prisma.user.create({
    data: {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || null,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
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
