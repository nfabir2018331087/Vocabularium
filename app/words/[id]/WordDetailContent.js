"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import DeleteButton from "./DeleteButton";
import ShareWordButton from "./ShareWordButton";
import PronounceButton from "./PronounceButton";

export default function WordDetailContent({ word, showShare = true }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div className="flex items-start justify-between mt-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{word.word}</h1>
              <PronounceButton word={word.word} />
            </div>
            {word.partOfSpeech && (
              <span className="inline-block mt-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {word.partOfSpeech}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-1">
            {showShare && <ShareWordButton wordId={word.id} />}
            <Link
              href={`/words/${word.id}/edit`}
              replace
              className="p-2 rounded-xl bg-surface-alt border border-border hover:border-primary text-text-secondary hover:text-primary transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
            <DeleteButton id={word.id} />
          </div>
        </div>
      </div>

      {/* Meanings */}
      <div className="flex flex-col gap-3">
        <div className="p-4 rounded-2xl bg-surface-alt border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">English Meaning</h2>
          </div>
          <p className="text-text leading-relaxed">{word.meaningEn}</p>
        </div>

        {word.meaningBn && (
          <div className="p-4 rounded-2xl bg-surface-alt border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">বাংলা অর্থ</h2>
            </div>
            <p className="text-text leading-relaxed">{word.meaningBn}</p>
          </div>
        )}
      </div>

      {/* Explanation */}
      {word.explanation && (
        <div className="p-4 rounded-2xl bg-surface-alt border border-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Explanation</h2>
          </div>
          <p className="text-text text-sm leading-relaxed">{word.explanation}</p>
        </div>
      )}

      {/* Examples */}
      {word.examples.length > 0 && (
        <div className="p-4 rounded-2xl bg-surface-alt border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-light" />
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Examples</h2>
          </div>
          <ul className="flex flex-col gap-2.5">
            {word.examples.map((ex, i) => (
              <li key={i} className="text-sm text-text flex gap-2.5 items-start">
                <span className="text-xs text-text-secondary bg-surface border border-border rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 font-medium">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {word.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {word.tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Meta */}
      <p className="text-xs text-text-secondary">
        Added {new Date(word.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );
}