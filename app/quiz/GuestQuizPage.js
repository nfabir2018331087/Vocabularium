"use client";

import { useState, useEffect } from "react";
import { getLocalWords } from "../../lib/local-words";
import { getLocalQuizResults } from "../../lib/local-quiz";
import QuizPageContent from "./QuizPageContent";

export default function GuestQuizPage() {
  const [words, setWords] = useState([]);
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getLocalWords(), getLocalQuizResults()]).then(([w, results]) => {
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
    });
  }, []);

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-32 bg-surface-alt rounded-lg skeleton" />
        <div className="h-4 w-48 bg-surface-alt rounded skeleton" />
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-alt rounded-2xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return <QuizPageContent words={words} isGuest={true} progress={progress} />;
}
