"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLocalWord } from "../../../lib/local-words";
import WordDetailContent from "./WordDetailContent";

export default function GuestWordDetail({ id }) {
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
      <div className="flex flex-col gap-5 pb-8 -mx-4 -mt-6">
        <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
          <div className="h-4 w-16 bg-white/20 rounded" />
          <div className="h-9 w-48 bg-white/20 rounded-lg mt-3" />
        </div>
        <div className="px-4 flex flex-col gap-4">
          <div className="h-24 bg-surface-alt rounded-2xl skeleton" />
          <div className="h-24 bg-surface-alt rounded-2xl skeleton" />
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

  return <WordDetailContent word={word} showShare={false} />;
}
