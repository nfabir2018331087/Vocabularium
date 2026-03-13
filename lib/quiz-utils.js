// Fisher-Yates shuffle
export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate N wrong meaning options from pool, excluding the correct word
export function generateOptions(correctWord, allWords, count = 3) {
  const others = allWords.filter((w) => w.id !== correctWord.id);
  const shuffled = shuffle(others);
  return shuffled.slice(0, count).map((w) => w.meaningEn);
}

// Fuzzy match using normalized Levenshtein distance
export function fuzzyMatch(input, target, threshold = 0.75) {
  const a = normalize(input);
  const b = normalize(target);
  if (a === b) return true;
  if (b.includes(a) || a.includes(b)) return true;
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return true;
  return (1 - distance / maxLen) >= threshold;
}

function normalize(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = a[i - 1] === b[j - 1]
        ? matrix[i - 1][j - 1]
        : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
    }
  }
  return matrix[a.length][b.length];
}

// Generate match pairs: pick N words and return shuffled columns
export function generateMatchPairs(words, count = 5) {
  const selected = shuffle(words).slice(0, count);
  return {
    words: shuffle(selected.map((w) => ({ id: w.id, text: w.word }))),
    meanings: shuffle(selected.map((w) => ({ id: w.id, text: w.meaningEn }))),
  };
}

export const QUIZ_MODES = [
  {
    id: "flashcard",
    label: "Flashcard",
    minWords: 1,
    description: "Flip cards to reveal meanings",
  },
  {
    id: "multiple_choice",
    label: "Multiple Choice",
    minWords: 4,
    description: "Pick the correct meaning",
  },
  {
    id: "type_answer",
    label: "Type Answer",
    minWords: 1,
    description: "Type the English meaning",
  },
  {
    id: "match_pairs",
    label: "Match Pairs",
    minWords: 4,
    description: "Connect words with meanings",
  },
];
