import { getWords } from "../actions/words";
import WordsList from "./WordsList";

export default async function Words() {
  const { words, error } = await getWords();

  return (
    <div className="flex flex-col gap-4 pb-8">
      <h1 className="text-2xl font-bold">My Words</h1>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {words.length === 0 && !error ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">No words yet.</p>
          <a href="/add" className="text-primary font-medium text-sm mt-2 inline-block">
            Add your first word
          </a>
        </div>
      ) : (
        <WordsList words={words} />
      )}
    </div>
  );
}
