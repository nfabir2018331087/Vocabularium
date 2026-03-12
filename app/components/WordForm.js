"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Toast from "./Toast";

const PARTS_OF_SPEECH = [
  "Noun",
  "Verb",
  "Adjective",
  "Adverb",
  "Pronoun",
  "Preposition",
  "Conjunction",
  "Interjection",
];

export default function WordForm({ initialData, onSubmit, submitLabel = "Save Word", successMessage = "Word saved!" }) {
  const router = useRouter();
  const [examples, setExamples] = useState(
    initialData?.examples?.length ? initialData.examples : [""]
  );
  const [tags, setTags] = useState(
    initialData?.tags?.join(", ") || ""
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const addExample = () => setExamples([...examples, ""]);

  const removeExample = (index) => {
    if (examples.length === 1) return;
    setExamples(examples.filter((_, i) => i !== index));
  };

  const updateExample = (index, value) => {
    const updated = [...examples];
    updated[index] = value;
    setExamples(updated);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    formData.delete("examples");
    examples.forEach((ex) => formData.append("examples", ex));

    const result = await onSubmit(formData);

    if (result.error) {
      showToast(result.error, "error");
      setLoading(false);
      return;
    }

    showToast(successMessage);
    setLoading(false);
    setTimeout(() => router.push(`/words/${result.id}`), 1000);
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Word */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="word" className="text-sm font-medium">
            Word <span className="text-red-400">*</span>
          </label>
          <input
            id="word"
            name="word"
            type="text"
            required
            defaultValue={initialData?.word || ""}
            placeholder="Enter the word"
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
          />
        </div>

        {/* Parts of Speech */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="partOfSpeech" className="text-sm font-medium">
            Part of Speech <span className="text-text-secondary text-xs">(optional)</span>
          </label>
          <select
            id="partOfSpeech"
            name="partOfSpeech"
            defaultValue={initialData?.partOfSpeech || ""}
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text"
          >
            <option value="" disabled>Select part of speech</option>
            {PARTS_OF_SPEECH.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        {/* English Meaning */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meaningEn" className="text-sm font-medium">
            Meaning (English) <span className="text-red-400">*</span>
          </label>
          <textarea
            id="meaningEn"
            name="meaningEn"
            required
            rows={2}
            defaultValue={initialData?.meaningEn || ""}
            placeholder="English meaning"
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50 resize-none"
          />
        </div>

        {/* Bangla Meaning */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="meaningBn" className="text-sm font-medium">
            অর্থ (বাংলা) <span className="text-text-secondary text-xs">(optional)</span>
          </label>
          <textarea
            id="meaningBn"
            name="meaningBn"
            rows={2}
            defaultValue={initialData?.meaningBn || ""}
            placeholder="বাংলায় অর্থ লিখুন"
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50 resize-none"
          />
        </div>

        {/* Explanation */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="explanation" className="text-sm font-medium">
            Explanation <span className="text-text-secondary text-xs">(optional)</span>
          </label>
          <textarea
            id="explanation"
            name="explanation"
            rows={3}
            defaultValue={initialData?.explanation || ""}
            placeholder="Add context, notes, or a detailed explanation"
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50 resize-none"
          />
        </div>

        {/* Examples */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Examples <span className="text-text-secondary text-xs">(optional)</span>
          </label>
          {examples.map((ex, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={ex}
                onChange={(e) => updateExample(i, e.target.value)}
                placeholder={`Example ${i + 1}`}
                className="flex-1 px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
              />
              {examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExample(i)}
                  className="px-3 rounded-xl border border-border text-text-secondary hover:text-red-400 hover:border-red-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addExample}
            className="self-start text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            + Add another example
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tags" className="text-sm font-medium">
            Tags <span className="text-text-secondary text-xs">(comma separated)</span>
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder='e.g. "novel, The Great Gatsby, formal"'
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
          />
          {tags && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {tags.split(",").map((t, i) =>
                t.trim() ? (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {t.trim()}
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </form>
    </>
  );
}
