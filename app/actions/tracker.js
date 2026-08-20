"use server";

import prisma from "../../lib/prisma";
import { getSupabaseUser } from "../../lib/supabase/server";
import { int, oneOf } from "../../lib/validate";

// Stored shape: { letters: { [A-Z]: { state, count } }, tags: { [tag]: { state, count } } }
const TRACKER_STATES = ["learning", "learned"];
const MAX_TAGS = 300;
const MAX_TAG_LEN = 40;
const MAX_COUNT = 100000;

function sanitizeEntries(source, { maxKeys, keyFilter }) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return {};

  const out = {};
  let kept = 0;
  for (const [rawKey, rawValue] of Object.entries(source)) {
    if (kept >= maxKeys) break;
    const key = keyFilter(rawKey);
    if (!key) continue;
    if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) continue;

    const state = oneOf(rawValue.state, TRACKER_STATES);
    if (!state) continue;

    out[key] = { state, count: int(rawValue.count, 0, MAX_COUNT, 0) };
    kept++;
  }
  return out;
}

// Rebuild the payload from a known shape rather than storing whatever the
// client sent. This column is read on every page load, so an unbounded blob
// here is both a storage and a latency problem.
function sanitizeTracker(data) {
  return {
    letters: sanitizeEntries(data?.letters, {
      maxKeys: 26,
      keyFilter: (k) => (/^[A-Z]$/.test(k) ? k : null),
    }),
    tags: sanitizeEntries(data?.tags, {
      maxKeys: MAX_TAGS,
      keyFilter: (k) => {
        const trimmed = typeof k === "string" ? k.trim() : "";
        return trimmed && trimmed.length <= MAX_TAG_LEN ? trimmed : null;
      },
    }),
  };
}

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
    data: { trackerData: sanitizeTracker(data) },
  });

  return { success: true };
}
