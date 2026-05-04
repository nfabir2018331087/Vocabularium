"use client";

import { useState, useMemo, useRef, useEffect } from "react";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function doExportCSV(words) {
  const headers = ["Word", "Meaning (En)", "Meaning (Bn)", "Explanation", "Examples"];
  const rows = words.map((w) => [
    w.word || "",
    w.meaningEn || "",
    w.meaningBn || "",
    w.explanation || "",
    (w.examples || []).join(" | "),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vocabularium-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function doExportPDF(words) {
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const rows = words
    .map(
      (w) => `<tr>
        <td>${escapeHtml(w.word)}</td>
        <td>${escapeHtml(w.meaningEn)}</td>
        <td>${escapeHtml(w.meaningBn)}</td>
        <td>${escapeHtml(w.explanation)}</td>
        <td>${(w.examples || []).map(escapeHtml).join("<br>")}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Vocabularium Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Noto Sans Bengali', system-ui, sans-serif; padding: 20px 24px; color: #111827; }
    .header { margin-bottom: 14px; }
    .header h1 { font-size: 15px; font-weight: 700; color: #4f46e5; }
    .header p { font-size: 10px; color: #6b7280; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    thead th { background: #4f46e5; color: #fff; padding: 7px 10px; text-align: left; font-weight: 600; }
    tbody td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; vertical-align: top; line-height: 1.5; }
    tbody tr:nth-child(even) td { background: #f9fafb; }
    @media print { @page { margin: 14mm; size: A4 landscape; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Vocabularium</h1>
    <p>${words.length} word${words.length !== 1 ? "s" : ""} &middot; ${date}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:13%">Word</th>
        <th style="width:22%">Meaning (En)</th>
        <th style="width:18%">Meaning (Bn)</th>
        <th style="width:25%">Explanation</th>
        <th style="width:22%">Examples</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.onafterprint = function() { window.close(); };
      }, 600);
    };
  </script>
</body>
</html>`;

  const printWin = window.open("", "_blank", "width=960,height=700");
  if (!printWin) {
    alert("Please allow pop-ups to export as PDF.");
    return;
  }
  printWin.document.write(html);
  printWin.document.close();
}

function ExportModal({ format, words, onClose }) {
  const [filterType, setFilterType] = useState("all");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);

  const allTags = useMemo(() => {
    const s = new Set();
    words.forEach((w) => (w.tags ?? []).forEach((t) => { if (t) s.add(t); }));
    return [...s].sort((a, b) => a.localeCompare(b));
  }, [words]);

  const availableLetters = useMemo(() => {
    const s = new Set();
    words.forEach((w) => { if (w.word?.[0]) s.add(w.word[0].toUpperCase()); });
    return s;
  }, [words]);

  const filteredWords = useMemo(() => {
    if (filterType === "tags" && selectedTags.length > 0)
      return words.filter((w) => (w.tags ?? []).some((t) => selectedTags.includes(t)));
    if (filterType === "letters" && selectedLetters.length > 0)
      return words.filter((w) => w.word?.[0] && selectedLetters.includes(w.word[0].toUpperCase()));
    return words;
  }, [words, filterType, selectedTags, selectedLetters]);

  const toggleTag = (tag) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const toggleLetter = (l) =>
    setSelectedLetters((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);

  function handleExport() {
    const sorted = [...filteredWords].sort((a, b) =>
      a.word.localeCompare(b.word, undefined, { sensitivity: "base" })
    );
    if (format === "csv") doExportCSV(sorted);
    else doExportPDF(sorted);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm max-h-[88vh] flex flex-col shadow-xl mb-16 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <h2 className="text-base font-semibold">Export as {format.toUpperCase()}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-secondary transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 pb-3 flex flex-col gap-4">

          {/* Word Pool */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">Word Pool</p>
            <div className="flex flex-col gap-1.5">
              {[
                { value: "all",     label: "All Words",   desc: "Export your entire vocabulary" },
                { value: "tags",    label: "By Tags",     desc: "Filter by specific tags" },
                { value: "letters", label: "By Letters",  desc: "Filter by starting letter" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    filterType === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="exportFilterType"
                    value={opt.value}
                    checked={filterType === opt.value}
                    onChange={() => {
                      setFilterType(opt.value);
                      setSelectedTags([]);
                      setSelectedLetters([]);
                    }}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${filterType === opt.value ? "border-primary" : "border-border"}`}>
                    {filterType === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{opt.label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Tags selector */}
          {filterType === "tags" && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                Select Tags
                {selectedTags.length > 0 && (
                  <span className="normal-case ml-1 text-primary font-normal">
                    · {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""},{" "}
                    {filteredWords.length} word{filteredWords.length !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              {allTags.length === 0 ? (
                <p className="text-sm text-text-secondary py-2">No tags found. Add tags to your words first.</p>
              ) : (
                <div className="max-h-44 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {allTags.map((tag) => {
                    const checked = selectedTags.includes(tag);
                    const count = words.filter((w) => (w.tags ?? []).includes(tag)).length;
                    return (
                      <label
                        key={tag}
                        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-alt cursor-pointer transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-border"}`}>
                          {checked && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <input type="checkbox" checked={checked} onChange={() => toggleTag(tag)} className="hidden" />
                        <span className="text-sm flex-1">{tag}</span>
                        <span className="text-xs text-text-secondary">{count}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Letters selector */}
          {filterType === "letters" && (
            <div>
              <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                Select Letters
                {selectedLetters.length > 0 && (
                  <span className="normal-case ml-1 text-primary font-normal">
                    · {selectedLetters.length} letter{selectedLetters.length !== 1 ? "s" : ""},{" "}
                    {filteredWords.length} word{filteredWords.length !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-7 gap-1">
                {LETTERS.map((letter) => {
                  const has = availableLetters.has(letter);
                  const sel = selectedLetters.includes(letter);
                  return (
                    <button
                      key={letter}
                      onClick={() => has && toggleLetter(letter)}
                      disabled={!has}
                      className={`aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        !has
                          ? "bg-surface-alt text-text-secondary/25 cursor-not-allowed"
                          : sel
                          ? "bg-primary text-white shadow-sm"
                          : "bg-surface-alt border border-border text-text hover:border-primary hover:text-primary"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Count preview */}
          <p className="text-xs text-text-secondary">
            {filteredWords.length === words.length
              ? `All ${words.length} word${words.length !== 1 ? "s" : ""} will be exported`
              : `${filteredWords.length} of ${words.length} word${words.length !== 1 ? "s" : ""} will be exported`}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-surface-alt border border-border text-text-secondary hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={filteredWords.length === 0}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              filteredWords.length > 0
                ? "bg-primary text-white hover:opacity-90 active:opacity-80"
                : "bg-surface-alt text-text-secondary/40 cursor-not-allowed"
            }`}
          >
            Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExportButton({ words }) {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const options = [
    {
      id: "csv",
      label: "CSV",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <line x1="8" y1="9" x2="10" y2="9" />
        </svg>
      ),
    },
    {
      id: "pdf",
      label: "PDF",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 13h1a2 2 0 010 4H9v-4z" />
          <path d="M14 13h2" />
          <path d="M14 17h2" />
          <path d="M19 13v4" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Export
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`w-3 h-3 transition-transform duration-150 ${open ? "rotate-180" : ""}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-32 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden py-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setOpen(false);
                  setExportFormat(opt.id);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-text-secondary hover:text-text hover:bg-surface-alt transition-colors"
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {exportFormat && (
        <ExportModal
          format={exportFormat}
          words={words}
          onClose={() => setExportFormat(null)}
        />
      )}
    </>
  );
}