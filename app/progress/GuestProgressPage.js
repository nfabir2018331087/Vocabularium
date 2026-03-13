"use client";

import { useState, useEffect } from "react";
import { getLocalWords } from "../../lib/local-words";
import { getLocalQuizResults } from "../../lib/local-quiz";
import ProgressPageContent from "./ProgressPageContent";

export default function GuestProgressPage() {
  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getLocalWords(), getLocalQuizResults()]).then(
      ([w, results]) => {
        // Compute per-word progress from local quiz results
        const stats = {};
        for (const r of results) {
          if (!r.testedWordIds) continue;
          for (const wid of r.testedWordIds) {
            if (!stats[wid]) stats[wid] = { tested: 0, missed: 0 };
            stats[wid].tested++;
            if (r.missed?.includes(wid)) stats[wid].missed++;
          }
        }
        setWords(w);
        setProgress(stats);
        setLoaded(true);
      }
    );
  }, []);

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <div className="h-8 w-40 bg-surface-alt rounded-lg skeleton" />
        <div className="h-4 w-56 bg-surface-alt rounded skeleton" />
        <div className="flex flex-col gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-surface-alt rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return <ProgressPageContent words={words} progress={progress} />;
}
