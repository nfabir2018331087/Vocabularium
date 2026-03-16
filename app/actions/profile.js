"use server";

import prisma from "../../lib/prisma";
import { getSupabaseServer, getSupabaseUser } from "../../lib/supabase/server";

async function getAuthenticatedUser() {
  return getSupabaseUser();
}

export async function uploadAvatar(formData) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("avatar");
  if (!file || file.size === 0) return { error: "No file selected" };

  // Validate file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Image must be under 2MB" };
  }

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}/avatar.${ext}`;

  const supabase = await getSupabaseServer();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error("Avatar upload failed:", uploadError);
    return { error: "Failed to upload avatar" };
  }

  const { data: { publicUrl } } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  // Add cache-bust to URL so browser fetches the new image
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  // Update Prisma User
  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl },
  });

  // Update Supabase auth metadata so AuthProvider picks it up
  await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  return { success: true, avatarUrl };
}

export async function updateProfile(data) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const name = data.name?.trim();
  if (!name) return { error: "Name is required" };

  await prisma.user.update({
    where: { id: user.id },
    data: { name },
  });

  const supabase = await getSupabaseServer();
  await supabase.auth.updateUser({
    data: { full_name: name },
  });

  return { success: true };
}
