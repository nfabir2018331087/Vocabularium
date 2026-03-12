import Link from "next/link";
import { getWord } from "../../actions/words";
import DeleteButton from "./DeleteButton";

export default async function WordDetail({ params }) {
  const { id } = await params;
  const { word, error } = await getWord(id);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-red-400">{error}</p>
        <Link href="/words" className="text-primary font-medium text-sm">
          Back to words
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/words" className="text-sm text-text-secondary hover:text-primary transition-colors">
            ← Back
          </Link>
          <h1 className="text-3xl font-bold mt-2">{word.word}</h1>
          {word.partOfSpeech && (
            <span className="text-sm text-text-secondary italic">{word.partOfSpeech}</span>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <Link
            href={`/words/${word.id}/edit`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-surface-alt border border-border hover:border-primary text-text-secondary hover:text-primary transition-colors"
          >
            Edit
          </Link>
          <DeleteButton id={word.id} />
        </div>
      </div>

      {/* Meanings */}
      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-surface-alt border border-border">
          <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">English Meaning</h2>
          <p className="text-text">{word.meaningEn}</p>
        </div>

        {word.meaningBn && (
          <div className="p-4 rounded-xl bg-surface-alt border border-border">
            <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">বাংলা অর্থ</h2>
            <p className="text-text">{word.meaningBn}</p>
          </div>
        )}
      </div>

      {/* Explanation */}
      {word.explanation && (
        <div className="p-4 rounded-xl bg-surface-alt border border-border">
          <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-1">Explanation</h2>
          <p className="text-text text-sm leading-relaxed">{word.explanation}</p>
        </div>
      )}

      {/* Examples */}
      {word.examples.length > 0 && (
        <div className="p-4 rounded-xl bg-surface-alt border border-border">
          <h2 className="text-xs font-medium text-text-secondary uppercase tracking-wide mb-2">Examples</h2>
          <ul className="flex flex-col gap-2">
            {word.examples.map((ex, i) => (
              <li key={i} className="text-sm text-text flex gap-2">
                <span className="text-text-secondary shrink-0">{i + 1}.</span>
                <span>{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {word.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {word.tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
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
