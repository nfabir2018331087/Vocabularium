"use client";

import { useRef, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { addWord } from "../actions/words";
import { assistWord } from "../actions/assist";
import { lookupDictionary } from "../actions/dictionary";
import { addLocalWord, getLocalWords } from "../../lib/local-words";
import WordForm from "../components/WordForm";

export default function AddWord() {
  const { isGuest } = useAuth();
  const formRef = useRef(null);
  const [dictionaryLoading, setDictionaryLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

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

    const existingWords = await getLocalWords();
    const isDuplicate = existingWords.some(
      (w) => w.word?.toLowerCase() === word.toLowerCase()
    );
    if (isDuplicate) return { error: `"${word}" is already in your vocabulary` };

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

  async function handleDictionaryFill() {
    const word = formRef.current?.getWord()?.trim();
    if (!word) {
      formRef.current?.showToast("Enter a word first.", "error");
      return;
    }
    setDictionaryLoading(true);
    const result = await lookupDictionary(word);
    if (result.error) {
      formRef.current?.showToast(result.error, "error");
      setDictionaryLoading(false);
      return;
    }
    if (result.success) {
      formRef.current?.mergeFill(result.data, "dictionary");
      formRef.current?.showToast("Dictionary filled the fields.");
    }
    setDictionaryLoading(false);
  }

  async function handleAiFill() {
    const word = formRef.current?.getWord()?.trim();
    if (!word) {
      formRef.current?.showToast("Enter a word first.", "error");
      return;
    }
    setAiLoading(true);
    const result = await assistWord(word);
    if (result.error) {
      formRef.current?.showToast(result.error, "error");
      setAiLoading(false);
      return;
    }
    if (result.success) {
      formRef.current?.mergeFill(result.data, "ai");
      formRef.current?.showToast("AI filled the fields.");
    }
    setAiLoading(false);
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
          onDictionaryFill={!isGuest ? handleDictionaryFill : undefined}
          onAiFill={!isGuest ? handleAiFill : undefined}
          dictionaryLoading={dictionaryLoading}
          aiLoading={aiLoading}
        />
      </div>
    </div>
  );
}
