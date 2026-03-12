"use client";

import { updateWord } from "../../../actions/words";
import WordForm from "../../../components/WordForm";

export default function EditForm({ word }) {
  async function handleUpdate(formData) {
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
