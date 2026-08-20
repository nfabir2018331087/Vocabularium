"use server";

import prisma from "../../lib/prisma";
import { getSupabaseServer, getSupabaseUser } from "../../lib/supabase/server";

// Kept under Next's 1 MB server action body limit, with headroom for the
// multipart envelope.
const MAX_AVATAR_BYTES = 900 * 1024;
const ALLOWED_AVATAR_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

async function getAuthenticatedUser() {
  return getSupabaseUser();
}

export async function uploadAvatar(formData) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("avatar");
  if (!file || file.size === 0) return { error: "No file selected" };

  // Validate file
  if (!ALLOWED_AVATAR_EXT[file.type]) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
  }
  // Next.js rejects server action bodies over 1 MB before this code runs, so a
  // 2 MB ceiling here produced an unhandled 413 rather than this message.
  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Image must be under 900KB. Try a smaller photo." };
  }

  // Derive the extension from the validated content type — the client-supplied
  // filename could contain anything, and varying it orphaned the previous
  // upload because upsert only matches an identical path.
  const ext = ALLOWED_AVATAR_EXT[file.type];
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
