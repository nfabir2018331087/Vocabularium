"use server";

import prisma from "../../lib/prisma";
import { getSupabaseUser } from "../../lib/supabase/server";

export async function getTrackerData() {
  const user = await getSupabaseUser();
  if (!user) return { data: null };

  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { trackerData: true },
  });

  return { data: u?.trackerData || null };
}

export async function saveTrackerData(data) {
  const user = await getSupabaseUser();
  if (!user) return { error: "Not authenticated" };

  await prisma.user.update({
    where: { id: user.id },
    data: { trackerData: data },
  });

  return { success: true };
}
