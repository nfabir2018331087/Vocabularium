"use server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

function normalizeWord(value) {
  return (value || "").trim().toLowerCase();
}

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

export async function assistWord(rawWord) {
  const word = (rawWord || "").trim();
  if (!word) return { error: "Enter a word first." };

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "Missing GROQ_API_KEY on the server." };

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const system = [
    "You are a careful dictionary assistant.",
    "Return ONLY valid JSON.",
    "If the word is misspelled, not a real word, or you are unsure, set status to \"not_found\" and include an error message.",
    "Do not hallucinate meanings.",
  ].join(" ");

  const user = [
    `Word: "${word}"`,
    "Return JSON with keys:",
    "status: \"ok\" or \"not_found\"",
    "word: corrected or normalized word (string)",
    "meaningEn: English meaning (string) upto 3, comma separated, capitalized first letter, and can't be empty",
    "meaningBn: Bangla meaning upto 3 comma separated or empty string",
    "partOfSpeech: one of Noun, Verb, Adjective, Adverb, Pronoun, Preposition, Conjunction, Interjection, or empty string",
    "explanation: brief explanation or empty string",
    "examples: array of 1-2 example sentences or empty array",
    "tags: array of 0-1 short tag to define broad category of the word with capitalized first letters or empty array",
    "error: error message if status is not_found",
  ].join("\n");

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      return { error: "AI service failed. Please try again." };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJson(content);

    console.log("AI Assist Response:", { parsed });

    if (!parsed) {
      return { error: "AI response was invalid. Please try again." };
    }

    if (parsed.status !== "ok") {
      return { error: parsed.error || "No reliable meaning found. Check spelling and try again." };
    }

    const meaningEn = (parsed.meaningEn || "").trim();
    if (!meaningEn) {
      return { error: "No reliable meaning found. Check spelling and try again." };
    }

    const returnedWord = (parsed.word || word).trim();
    if (normalizeWord(returnedWord) !== normalizeWord(word)) {
      return { error: "The word may be misspelled. Please check and try again." };
    }

    const examples = Array.isArray(parsed.examples) ? parsed.examples.filter(Boolean).slice(0, 3) : [];
    const tags = Array.isArray(parsed.tags) ? parsed.tags.filter(Boolean).slice(0, 5) : [];

    return {
      success: true,
      data: {
        word: returnedWord,
        meaningEn,
        meaningBn: (parsed.meaningBn || "").trim(),
        partOfSpeech: (parsed.partOfSpeech || "").trim(),
        explanation: (parsed.explanation || "").trim(),
        examples,
        tags,
      },
    };
  } catch {
    return { error: "AI request failed. Please try again." };
  }
}
