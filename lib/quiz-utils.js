// Compute a selection weight for a word based on its quiz history.
//
// Two factors are combined multiplicatively:
//
//   frequencyFactor = 1 / (tested + 1)
//     Untested  → 1.00   (highest pull)
//     Tested 1× → 0.50
//     Tested 5× → 0.17
//     Tested 10×→ 0.09   (still present, just less likely)
//
//   accuracyFactor = (1 − accuracy) × 0.6 + 0.4
//     0 % accuracy  → 1.00   (needs the most work)
//     50% accuracy  → 0.70
//     100% accuracy → 0.40   (minimum, never zero)
//     Untested      → 0.70   (treated as neutral/mid-range)
//
//   weight = frequencyFactor × accuracyFactor
//
// Examples (word: weight):
//   Untested             → 1.00 × 0.70 = 0.70
//   1 test, 0% acc       → 0.50 × 1.00 = 0.50
//   1 test, 50% acc      → 0.50 × 0.70 = 0.35
//   1 test, 100% acc     → 0.50 × 0.40 = 0.20
//   5 tests, 0% acc      → 0.17 × 1.00 = 0.17
//   10 tests, 90% acc    → 0.09 × 0.46 = 0.04  (rare but possible)
function computeWeight(word, progress) {
  const stat = progress[word.id];
  const tested = stat?.tested ?? 0;
  const frequencyFactor = 1 / (tested + 1);
  const accuracyFactor = !stat || tested === 0
    ? 0.7
    : (1 - (stat.tested - stat.missed) / stat.tested) * 0.6 + 0.4;
  return frequencyFactor * accuracyFactor;
}

// Weighted random sampling without replacement.
// Picks `count` words (or all if count is null) with probability proportional
// to each word's weight, then shuffles the result so the draw order is hidden.
// Falls back to plain Fisher-Yates when no progress data exists yet.
export function weightedSample(words, count, progress) {
  const n = count ?? words.length;
  if (!progress || Object.keys(progress).length === 0) {
    return shuffle(words).slice(0, n);
  }

  const pool = words.map((w) => ({ word: w, weight: computeWeight(w, progress) }));
  const result = [];
  // Pre-compute limit — pool.length shrinks each iteration so evaluating
  // Math.min(n, pool.length) inside the condition would halve the result for "All".
  const limit = Math.min(n, pool.length);

  for (let i = 0; i < limit; i++) {
    let r = Math.random() * pool.reduce((sum, item) => sum + item.weight, 0);
    for (let j = 0; j < pool.length; j++) {
      r -= pool[j].weight;
      if (r <= 0) {
        result.push(pool[j].word);
        pool.splice(j, 1);
        break;
      }
    }
  }

  return shuffle(result);
}

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
