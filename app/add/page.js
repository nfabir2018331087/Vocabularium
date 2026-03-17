"use client";

import { useRef, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { addWord } from "../actions/words";
import { assistWord } from "../actions/assist";
import { addLocalWord } from "../../lib/local-words";
import WordForm from "../components/WordForm";

export default function AddWord() {
  const { isGuest } = useAuth();
  const formRef = useRef(null);
  const [assistLoading, setAssistLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState("");

  async function handleLocalAdd(formData) {
    const word = formData.get("word")?.trim();
    const meaningEn = formData.get("meaningEn")?.trim();
    const meaningBn = formData.get("meaningBn")?.trim() || null;
    const partOfSpeech = formData.get("partOfSpeech")?.trim() || null;
    const explanation = formData.get("explanation")?.trim() || null;
    const examplesRaw = formData.getAll("examples");
    const tagsRaw = formData.get("tags")?.trim();

    if (!word) return { error: "Word is required" };
    if (!meaningEn) return { error: "English meaning is required" };

    const examples = examplesRaw
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    try {
      const created = await addLocalWord({
        word,
        meaningEn,
        meaningBn,
        partOfSpeech,
        explanation,
        examples,
        tags,
      });
      return { success: true, id: created.id };
    } catch {
      return { error: "Failed to save word locally" };
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-white">Add New Word</h1>
        <p className="text-sm text-white/75 mt-0.5">Save a word with meaning, examples & tags</p>
      </div>
      <div className="px-4">
        <WordForm
          ref={formRef}
          onSubmit={isGuest ? handleLocalAdd : addWord}
          submitLabel="Save Word"
          successMessage="Word added successfully!"
          onWordChange={setCurrentWord}
          assistLoading={assistLoading}
          wordAccessory={!isGuest ? (
            <div className="flex flex-col items-center gap-1 pd-5">
              <span className={`text-[10px] uppercase tracking-wider ${
                currentWord.trim() || assistLoading ? "text-text-secondary" : "text-text-secondary/60"
              }`}>
                Auto-fill
              </span>
              <button
                type="button"
                onClick={async () => {
                  const word = formRef.current?.getWord()?.trim();
                  if (!word) {
                    formRef.current?.showToast("Enter a word first.", "error");
                    return;
                  }
                setAssistLoading(true);
                const result = await assistWord(word);
                if (result.error) {
                  formRef.current?.clearFields();
                  formRef.current?.showToast(result.error, "error");
                  setAssistLoading(false);
                  return;
                }
                if (result.success) {
                  formRef.current?.applyAssist(result.data);
                  formRef.current?.showToast("AI filled the fields.");
                  }
                  setAssistLoading(false);
                }}
                disabled={!currentWord.trim() || assistLoading}
                className={`relative inline-flex items-center justify-center w-11 h-11 rounded-full border transition-all ${
                  assistLoading
                    ? "bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 border-transparent text-white shadow-[0_0_18px_rgba(139,92,246,0.6)]"
                    : currentWord.trim()
                      ? "bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 border-transparent text-white hover:scale-[1.03]"
                      : "bg-surface-alt border-border text-text-secondary"
                } disabled:cursor-not-allowed`}
                title="Auto-fill using AI"
                aria-label="AI assist"
              >
                {assistLoading ? (
                  <span className="absolute -inset-1 rounded-full blur-md bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 opacity-70" />
                ) : null}
                <svg
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 relative ${!currentWord.trim() && !assistLoading ? "text-text-secondary" : "text-white"}`}
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
              </button>
            </div>
          ) : null}
        />
      </div>
    </div>
  );
}
