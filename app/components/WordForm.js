"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
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

function mergeText(prev, next, sep = ", ") {
  let prevTrimmed = (prev || "").trim();
  const nextTrimmed = (next || "").trim();
  if (!nextTrimmed) return prevTrimmed;
  if (!prevTrimmed) return nextTrimmed;
  if (prevTrimmed.toLowerCase().includes(nextTrimmed.toLowerCase())) return prevTrimmed;
  if (sep === ", ") prevTrimmed = prevTrimmed.replace(/\.+\s*$/, "");
  return `${prevTrimmed}${sep}${nextTrimmed}`;
}

function mergeArray(prevArr, nextArr, max) {
  const result = [...prevArr];
  const seen = new Set(result.map((item) => item.toLowerCase()));
  for (const item of nextArr) {
    const trimmed = (item || "").trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    result.push(trimmed);
    if (result.length >= max) break;
  }
  return result;
}

function AiSparkle() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l1.6 3.3L17 8l-3.4 1.7L12 13l-1.6-3.3L7 8l3.4-1.7L12 3z" />
      <path d="M5 14l.9 1.8L8 17l-2.1 1.2L5 20l-.9-1.8L2 17l2.1-1.2L5 14z" />
      <path d="M18.5 14.5l1.1 2.2L22 18l-2.4 1.3-1.1 2.2-1.1-2.2L15 18l2.4-1.3 1.1-2.2z" />
    </svg>
  );
}

function DictionaryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  );
}

const WordForm = forwardRef(function WordForm(
  {
    initialData,
    onSubmit,
    submitLabel = "Save Word",
    successMessage = "Word saved!",
    onWordChange,
    onDictionaryFill,
    onAiFill,
    dictionaryLoading = false,
    aiLoading = false,
  },
  ref
) {
  const assistLoading = dictionaryLoading || aiLoading;
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
  const lastFilledWordRef = useRef(initialData?.word ? initialData.word.trim().toLowerCase() : null);

  const isDirty = !initialData ||
    word !== (initialData.word || "") ||
    meaningEn !== (initialData.meaningEn || "") ||
    meaningBn !== (initialData.meaningBn || "") ||
    partOfSpeech !== (initialData.partOfSpeech || "") ||
    explanation !== (initialData.explanation || "") ||
    tags !== (initialData.tags?.join(", ") || "") ||
    JSON.stringify(examples.filter(Boolean)) !== JSON.stringify((initialData.examples ?? []).filter(Boolean));

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
    mergeFill: (data, source) => {
      const currentWord = word.trim().toLowerCase();
      const isNewWord = currentWord !== lastFilledWordRef.current;
      lastFilledWordRef.current = currentWord;

      if (source === "ai") {
        const nextWord = typeof data?.word === "string" ? data.word.trim() : "";
        if (nextWord) {
          setWord(nextWord);
          if (onWordChange) onWordChange(nextWord);
          lastFilledWordRef.current = nextWord.trim().toLowerCase();
        }
      }

      if (typeof data?.meaningEn === "string" && data.meaningEn.trim()) {
        setMeaningEn((prev) => mergeText(isNewWord ? "" : prev, data.meaningEn));
      }
      if (typeof data?.meaningBn === "string" && data.meaningBn.trim()) {
        setMeaningBn((prev) => mergeText(isNewWord ? "" : prev, data.meaningBn));
      }
      if (typeof data?.partOfSpeech === "string" && data.partOfSpeech.trim()) {
        setPartOfSpeech((prev) => {
          const effectivePrev = isNewWord ? "" : prev;
          return source === "dictionary" ? data.partOfSpeech : effectivePrev || data.partOfSpeech;
        });
      }
      if (typeof data?.explanation === "string" && data.explanation.trim()) {
        setExplanation((prev) => mergeText(isNewWord ? "" : prev, data.explanation, "\n\n"));
      }
      if (Array.isArray(data?.examples) && data.examples.length > 0) {
        setExamples((prev) => mergeArray((isNewWord ? [] : prev).filter(Boolean), data.examples, 5));
      }
      if (Array.isArray(data?.tags) && data.tags.length > 0) {
        setTags((prev) => {
          const effectivePrev = isNewWord ? "" : prev;
          const prevTags = effectivePrev ? effectivePrev.split(",").map((t) => t.trim()).filter(Boolean) : [];
          return mergeArray(prevTags, data.tags, 6).join(", ");
        });
      }

      // Fields not returned by this source (e.g. Dictionary never returns meaningBn/tags)
      // still need clearing on a word change so leftovers from the previous word don't linger.
      if (isNewWord) {
        if (!(typeof data?.meaningBn === "string" && data.meaningBn.trim())) setMeaningBn("");
        if (!(typeof data?.partOfSpeech === "string" && data.partOfSpeech.trim())) setPartOfSpeech("");
        if (!(typeof data?.explanation === "string" && data.explanation.trim())) setExplanation("");
        if (!(Array.isArray(data?.examples) && data.examples.length > 0)) setExamples([""]);
        if (!(Array.isArray(data?.tags) && data.tags.length > 0)) setTags("");
      }
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

    // Authenticated add/edit redirects server-side on success (see app/actions/words.js) —
    // this only returns normally for guest (local) submissions, or on error.
    const result = await onSubmit(formData);

    if (result.error) {
      showToast(result.error, "error");
      setLoading(false);
      return;
    }

    showToast(successMessage);
    setLoading(false);
    router.replace(`/words/${result.id}`);
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
            {dictionaryLoading ? "Looking up the dictionary..." : "Filling fields with AI..."}
          </div>
        )}
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
            autoFocus={!initialData}
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

        {(onDictionaryFill || onAiFill) && !isGuest && (
          <>
            <div className="relative my-1">
              <div className="h-px bg-border" />
              <span className="text-center absolute left-1/5 right-1/5 min-[428px]:left-1/4 min-[428px]:right-1/4 -top-2.5 px-3 text-[10px] uppercase tracking-wider text-text-secondary bg-surface">
                Auto Fill
              </span>
            </div>

            <div className="flex items-center justify-around gap-3">
              <button
                type="button"
                onClick={onDictionaryFill}
                disabled={!word.trim() || assistLoading}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border transition-all bg-surface-alt border-border enabled:hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-text-secondary">
                  {dictionaryLoading ? (
                    <span className="inline-flex h-4 w-4 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                  ) : (
                    <DictionaryIcon />
                  )}
                </span>
                <span className="text-sm font-semibold">Dictionary</span>
              </button>

              <button
                type="button"
                onClick={onAiFill}
                disabled={!word.trim() || assistLoading}
                className="relative flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-transparent transition-all bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 text-white enabled:hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading && (
                  <span className="absolute -inset-1 rounded-lg blur-md bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 opacity-70" />
                )}
                <span className="relative">
                  {aiLoading ? (
                    <span className="inline-flex h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  ) : (
                    <AiSparkle />
                  )}
                </span>
                <span className="relative text-sm font-semibold">AI Assist</span>
              </button>
            </div>
          </>
        )}

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
          <div className="relative">
            <select
              id="partOfSpeech"
              name="partOfSpeech"
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              disabled={assistLoading}
              className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text"
            >
              <option value="" disabled>Select part of speech</option>
              {PARTS_OF_SPEECH.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
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
          disabled={loading || assistLoading || !isDirty}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </form>
    </>
  );
});

export default WordForm;
