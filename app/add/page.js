"use client";

import { addWord } from "../actions/words";
import WordForm from "../components/WordForm";

export default function AddWord() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Add New Word</h1>
        <p className="text-sm text-text-secondary mt-0.5">Save a word with meaning, examples & tags</p>
      </div>
      <WordForm
        onSubmit={addWord}
        submitLabel="Save Word"
        successMessage="Word added successfully!"
      />
    </div>
  );
}
