"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
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

const WordForm = forwardRef(function WordForm(
  { initialData, onSubmit, submitLabel = "Save Word", successMessage = "Word saved!", onWordChange, assistLoading = false, wordAccessory },
  ref
) {
  const router = useRouter();
  const [word, setWord] = useState(initialData?.word || "");
  const [meaningEn, setMeaningEn] = useState(initialData?.meaningEn || "");
  const [meaningBn, setMeaningBn] = useState(initialData?.meaningBn || "");
  const [partOfSpeech, setPartOfSpeech] = useState(initialData?.partOfSpeech || "");
  const [explanation, setExplanation] = useState(initialData?.explanation || "");
  const [examples, setExamples] = useState(initialData?.examples?.length ? initialData.examples : [""]);
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { isGuest } = useAuth();

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    setWord(initialData?.word || "");
    setMeaningEn(initialData?.meaningEn || "");
    setMeaningBn(initialData?.meaningBn || "");
    setPartOfSpeech(initialData?.partOfSpeech || "");
    setExplanation(initialData?.explanation || "");
    setExamples(initialData?.examples?.length ? initialData.examples : [""]);
    setTags(initialData?.tags?.join(", ") || "");
    if (onWordChange) onWordChange(initialData?.word || "");
  }, [initialData, onWordChange]);

  useImperativeHandle(ref, () => ({
    getWord: () => word,
    applyAssist: (data) => {
      const nextWord = typeof data?.word === "string" ? data.word.trim() : "";
      const nextMeaningEn = typeof data?.meaningEn === "string" ? data.meaningEn : "";
      const nextMeaningBn = typeof data?.meaningBn === "string" ? data.meaningBn : "";
      const nextPartOfSpeech = typeof data?.partOfSpeech === "string" ? data.partOfSpeech : "";
      const nextExplanation = typeof data?.explanation === "string" ? data.explanation : "";
      const nextExamples = Array.isArray(data?.examples) ? data.examples.filter((e) => typeof e === "string") : [];
      const nextTags = Array.isArray(data?.tags) ? data.tags.filter((t) => typeof t === "string") : [];

      setWord(nextWord);
      if (onWordChange) onWordChange(nextWord);
      setMeaningEn(nextMeaningEn);
      setMeaningBn(nextMeaningBn);
      setPartOfSpeech(nextPartOfSpeech);
      setExplanation(nextExplanation);
      setExamples(nextExamples.length > 0 ? nextExamples : [""]);
      setTags(nextTags.join(", "));
    },
    clearFields: () => {
      setWord(word);
      if (onWordChange) onWordChange("");
      setMeaningEn("");
      setMeaningBn("");
      setPartOfSpeech("");
      setExplanation("");
      setExamples([""]);
      setTags("");
    },
    showToast,
  }), [word, onWordChange, showToast]);

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

    const formData = new FormData();
    formData.set("word", word);
    formData.set("meaningEn", meaningEn);
    formData.set("meaningBn", meaningBn);
    formData.set("partOfSpeech", partOfSpeech);
    formData.set("explanation", explanation);
    examples.forEach((ex) => formData.append("examples", ex));
    formData.set("tags", tags);

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-busy={assistLoading}>
        {assistLoading && (
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="inline-flex h-3 w-3 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
            Filling fields with AI...
          </div>
        )}
        {/* Word */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="word" className="text-sm font-medium">
            Word <span className="text-red-400">*</span>
          </label>
          <div className="flex items-end gap-3">
            <div className="flex-[2] min-w-0">
              <input
                id="word"
                name="word"
                type="text"
                required
                value={word}
                onChange={(e) => {
                  setWord(e.target.value);
                  if (onWordChange) onWordChange(e.target.value);
                }}
                placeholder="Enter the word"
                disabled={assistLoading}
                className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
              />
            </div>
            {wordAccessory ? (
              <div className="flex-[1] flex items-end justify-end">
                {wordAccessory}
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative my-1">
          <div className="h-px bg-border" />
          {!isGuest && (
            <span className="text-center absolute left-1/5 right-1/5 min-[428px]:left-1/4 min-[428px]:right-1/4 -top-2.5 px-3 text-[10px] uppercase tracking-wider text-text-secondary bg-surface">
              Or fill everything yourself
            </span>
          )}
        </div>

        {/* Parts of Speech */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="partOfSpeech" className="text-sm font-medium">
            Part of Speech <span className="text-text-secondary text-xs">(optional)</span>
          </label>
          <select
            id="partOfSpeech"
            name="partOfSpeech"
            value={partOfSpeech}
            onChange={(e) => setPartOfSpeech(e.target.value)}
            disabled={assistLoading}
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
            value={meaningEn}
            onChange={(e) => setMeaningEn(e.target.value)}
            placeholder="English meaning"
            disabled={assistLoading}
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
            value={meaningBn}
            onChange={(e) => setMeaningBn(e.target.value)}
            placeholder="বাংলায় অর্থ লিখুন"
            disabled={assistLoading}
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
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Add context, notes, or a detailed explanation"
            disabled={assistLoading}
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
                disabled={assistLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
              />
              {examples.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExample(i)}
                  disabled={assistLoading}
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
            disabled={assistLoading}
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
            disabled={assistLoading}
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
          disabled={loading || assistLoading}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </form>
    </>
  );
});

export default WordForm;
