"use client";

import { useState, useEffect } from "react";
import { getLocalWords } from "../../lib/local-words";
import WordsPageContent from "./WordsPageContent";

export default function GuestWordsPage() {
  const [words, setWords] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getLocalWords().then((w) => {
      setWords(w);
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="h-8 w-32 bg-surface-alt rounded-lg skeleton" />
        <div className="h-10 bg-surface-alt rounded-xl skeleton" />
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-surface-alt rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return <WordsPageContent words={words} error={null} />;
}
