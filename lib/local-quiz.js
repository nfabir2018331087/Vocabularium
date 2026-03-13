import { get, set } from "idb-keyval";

const QUIZ_KEY = "vocabularium_quiz_results";

export async function getLocalQuizResults() {
  return (await get(QUIZ_KEY)) || [];
}

export async function saveLocalQuizResult({ mode, score, total, missed, duration, testedWordIds }) {
  const results = await getLocalQuizResults();
  const newResult = {
    id: "local_" + crypto.randomUUID(),
    mode,
    score,
    total,
    missed,
    testedWordIds: testedWordIds || [],
    duration,
    createdAt: new Date().toISOString(),
  };
  results.unshift(newResult);
  await set(QUIZ_KEY, results);
  return newResult;
}
