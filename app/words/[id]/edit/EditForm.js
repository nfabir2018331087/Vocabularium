"use client";

import { useAuth } from "../../../components/AuthProvider";
import { updateWord } from "../../../actions/words";
import { updateLocalWord } from "../../../../lib/local-words";
import WordForm from "../../../components/WordForm";

export default function EditForm({ word }) {
  const { isGuest } = useAuth();

  async function handleUpdate(formData) {
    if (isGuest) {
      const wordVal = formData.get("word")?.trim();
      const meaningEn = formData.get("meaningEn")?.trim();
      const meaningBn = formData.get("meaningBn")?.trim() || null;
      const partOfSpeech = formData.get("partOfSpeech")?.trim() || null;
      const explanation = formData.get("explanation")?.trim() || null;
      const examplesRaw = formData.getAll("examples");
      const tagsRaw = formData.get("tags")?.trim();

      if (!wordVal) return { error: "Word is required" };
      if (!meaningEn) return { error: "English meaning is required" };

      const examples = examplesRaw
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      const tags = tagsRaw
        ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
        : [];

      try {
        const updated = await updateLocalWord(word.id, {
          word: wordVal,
          meaningEn,
          meaningBn,
          partOfSpeech,
          explanation,
          examples,
          tags,
        });
        return updated ? { success: true, id: word.id } : { error: "Word not found" };
      } catch {
        return { error: "Failed to update word locally" };
      }
    }

    return updateWord(word.id, formData);
  }

  return (
    <WordForm
      initialData={word}
      onSubmit={handleUpdate}
      submitLabel="Update Word"
      successMessage="Word updated successfully!"
    />
  );
}
