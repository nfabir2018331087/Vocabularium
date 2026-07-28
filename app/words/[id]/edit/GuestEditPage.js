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
      <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
        <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
          <div className="h-4 w-16 bg-white/20 rounded" />
          <div className="h-7 w-32 bg-white/20 rounded-lg mt-3" />
        </div>
        <div className="px-4 flex flex-col gap-4">
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
    <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Link
            href={`/words/${word.id}`}
            replace
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Word</h1>
            <p className="text-sm text-white/75 mt-0.5">Editing &ldquo;{word.word}&rdquo;</p>
          </div>
        </div>
      </div>
      <div className="px-4">
        <EditForm word={word} />
      </div>
    </div>
  );
}
