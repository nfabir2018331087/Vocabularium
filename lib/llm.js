const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callGemini({ system, user, temperature }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: user }] }],
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: { responseMimeType: "application/json", temperature },
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function callGroq({ system, user, temperature }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || null;
}

// Tries Gemini first (primary, higher accuracy), falls back to Groq if Gemini
// errors, is rate-limited, or has no key configured.
export async function chatJSON({ system, user, temperature = 0.2 }) {
  let raw = null;
  let provider = null;

  try {
    raw = await callGemini({ system, user, temperature });
    if (raw) provider = "gemini";
  } catch {
    raw = null;
  }

  if (!raw) {
    try {
      raw = await callGroq({ system, user, temperature });
      if (raw) provider = "groq";
    } catch {
      raw = null;
    }
  }

  if (!raw) return { parsed: null, raw: null, provider: null };
  return { parsed: extractJson(raw), raw, provider };
}
