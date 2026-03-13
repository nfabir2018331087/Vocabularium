"use client";

import { useState, useEffect } from "react";
import { getLocalWords } from "../../lib/local-words";
import HomeContent from "./HomeContent";

export default function GuestHomeContent() {
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
      <div className="flex flex-col gap-6 -mx-4 -mt-6">
        <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
          <div className="h-8 w-48 bg-white/20 rounded-lg" />
          <div className="h-4 w-64 bg-white/10 rounded mt-2" />
          <div className="flex gap-3 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 bg-white/10 rounded-2xl h-16" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <HomeContent words={words} />;
}
