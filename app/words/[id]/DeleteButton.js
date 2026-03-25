"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import { deleteWord, getWords } from "../../actions/words";
import { deleteLocalWord } from "../../../lib/local-words";
import { setCachedWords } from "../../../lib/client-cache";

export default function DeleteButton({ id }) {
  const router = useRouter();
  const { isGuest, user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);

    if (isGuest) {
      await deleteLocalWord(id);
      router.push("/words");
      return;
    }

    const result = await deleteWord(id);
    if (result.success) {
      if (user?.id) {
        const refreshed = await getWords();
        if (refreshed?.words) {
          setCachedWords(user.id, refreshed.words);
        }
      }
      router.push("/words");
    } else {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-1.5">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 rounded-xl text-sm font-medium bg-surface-alt border border-border text-text-secondary hover:text-text transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 rounded-xl bg-surface-alt border border-border text-text-secondary hover:text-red-400 hover:border-red-400 transition-colors"
      title="Delete"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    </button>
  );
}
