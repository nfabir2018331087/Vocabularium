"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLocalWord } from "../../../../lib/local-words";
import EditForm from "./EditForm";

export default function GuestEditPage({ id }) {
  const [word, setWord] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getLocalWord(id).then((w) => {
      setWord(w);
      setLoaded(true);
    });
  }, [id]);

  if (!loaded) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="h-4 w-16 bg-surface-alt rounded skeleton" />
        <div className="h-8 w-32 bg-surface-alt rounded-lg skeleton" />
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-alt rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-red-400">Word not found</p>
        <Link href="/words" className="text-primary font-medium text-sm">
          Back to words
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <Link href={`/words/${word.id}`} replace className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Word</h1>
        <p className="text-sm text-text-secondary mt-0.5">Editing &ldquo;{word.word}&rdquo;</p>
      </div>
      <EditForm word={word} />
    </div>
  );
}
