import { get, set, del } from "idb-keyval";

const WORDS_KEY = "vocabularium_words";

function localId() {
  return "local_" + crypto.randomUUID();
}

export async function getLocalWords() {
  return (await get(WORDS_KEY)) || [];
}

export async function getLocalWord(id) {
  const words = await getLocalWords();
  return words.find((w) => w.id === id) || null;
}

export async function addLocalWord(wordData) {
  const words = await getLocalWords();
  const now = new Date().toISOString();
  const newWord = {
    id: localId(),
    ...wordData,
    createdAt: now,
    updatedAt: now,
  };
  words.unshift(newWord);
  await set(WORDS_KEY, words);
  return newWord;
}

export async function updateLocalWord(id, wordData) {
  const words = await getLocalWords();
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return null;
  words[index] = {
    ...words[index],
    ...wordData,
    updatedAt: new Date().toISOString(),
  };
  await set(WORDS_KEY, words);
  return words[index];
}

export async function deleteLocalWord(id) {
  const words = await getLocalWords();
  const filtered = words.filter((w) => w.id !== id);
  await set(WORDS_KEY, filtered);
  return true;
}

export async function clearLocalWords() {
  await del(WORDS_KEY);
}
