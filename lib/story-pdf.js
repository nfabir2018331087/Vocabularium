function slugify(title) {
  const slug = (title || "story")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "story";
}

const PDF_SAFE_REPLACEMENTS = {
  "‘": "'", "’": "'", "‚": "'",
  "“": '"', "”": '"', "„": '"',
  "‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-",
  "…": "...",
  " ": " ",
};

// jsPDF's core "helvetica" font only supports WinAnsi/Latin-1 (\x00-\xFF). AI-generated
// text often includes smart-typography punctuation (non-breaking hyphens, curly quotes,
// em dashes) outside that range, which silently corrupts width measurement and rendering
// (missing/overlapping glyphs) — so normalize to ASCII equivalents, then strip anything
// still out of range as a final safety net.
function sanitizeForPdf(text) {
  const replaced = (text || "").replace(
    /[‘’‚“”„‐‑‒–—… ]/g,
    (ch) => PDF_SAFE_REPLACEMENTS[ch] ?? ch
  );
  return replaced.replace(/[^\x00-\xFF]/g, "");
}

export async function exportStoryPdf(story) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 18;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(sanitizeForPdf(story.title) || "Untitled story", maxWidth);
  titleLines.forEach((line) => {
    doc.text(line, margin, y);
    y += lineHeight + 4;
  });
  y += 8;

  doc.setFontSize(11);
  const spaceWidth = doc.getTextWidth(" ");
  let x = margin;

  const tokens = sanitizeForPdf(story.content)
    .split(/(\*\*.+?\*\*|\s+)/g)
    .filter((t) => t !== "");

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      if (token.includes("\n\n")) {
        x = margin;
        y += lineHeight;
      }
      continue;
    }

    const isBold = token.startsWith("**") && token.endsWith("**");
    const word = isBold ? token.slice(2, -2) : token;
    doc.setFont("helvetica", isBold ? "bold" : "normal");

    const wordWidth = doc.getTextWidth(word);
    if (x + wordWidth > margin + maxWidth) {
      x = margin;
      y += lineHeight;
    }
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
      x = margin;
    }

    doc.text(word, x, y);
    x += wordWidth + spaceWidth;
  }

  doc.save(`${slugify(story.title)}.pdf`);
}
