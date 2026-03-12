"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWord } from "../../actions/words";

export default function DeleteButton({ id }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteWord(id);
    if (result.success) {
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
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-alt border border-border text-text-secondary hover:text-text transition-colors"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-alt border border-border text-text-secondary hover:text-red-400 hover:border-red-400 transition-colors"
    >
      Delete
    </button>
  );
}
