"use client";

import { useAuth } from "../components/AuthProvider";
import { addWord } from "../actions/words";
import { addLocalWord } from "../../lib/local-words";
import WordForm from "../components/WordForm";

export default function AddWord() {
  const { isGuest } = useAuth();

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
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Add New Word</h1>
        <p className="text-sm text-text-secondary mt-0.5">Save a word with meaning, examples & tags</p>
      </div>
      <WordForm
        onSubmit={isGuest ? handleLocalAdd : addWord}
        submitLabel="Save Word"
        successMessage="Word added successfully!"
      />
    </div>
  );
}
