"use client";

import { addWord } from "../actions/words";
import WordForm from "../components/WordForm";

export default function AddWord() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <h1 className="text-2xl font-bold">Add New Word</h1>
      <WordForm
        onSubmit={addWord}
        submitLabel="Save Word"
        successMessage="Word added successfully!"
      />
    </div>
  );
}
