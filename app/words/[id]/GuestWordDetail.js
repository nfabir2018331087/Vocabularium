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
      <div className="flex flex-col gap-5 pb-8">
        <div className="h-4 w-16 bg-surface-alt rounded skeleton" />
        <div className="h-10 w-48 bg-surface-alt rounded-lg skeleton" />
        <div className="h-24 bg-surface-alt rounded-2xl skeleton" />
        <div className="h-24 bg-surface-alt rounded-2xl skeleton" />
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

  return <WordDetailContent word={word} />;
}
