"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import ExportButton from "./ExportButton";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A → Z" },
  { value: "z-a", label: "Z → A" },
  { value: "tags", label: "By Tag" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Words", desc: "Show your entire vocabulary" },
  { value: "tags", label: "By Tags", desc: "Filter by specific tags" },
  { value: "letters", label: "By Letters", desc: "Filter by starting letter" },
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function WordsList({ words, searchInHero, searchValue = "", onSearchChange }) {
  const PAGE_SIZES = [5, 10, 20];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // page, pageSize, sort, filter live in the URL so they survive navigation
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = (() => {
    const s = parseInt(searchParams.get("size") || "5", 10);
    return PAGE_SIZES.includes(s) ? s : 5;
  })();
  const filterType = searchParams.get("filter") || "all";
  const selectedTags = useMemo(
    () => (searchParams.get("ftags") || "").split(",").filter(Boolean),
    [searchParams]
  );
  const selectedLetters = useMemo(
    () => (searchParams.get("fletters") || "").split(",").filter(Boolean),
    [searchParams]
  );

  const updateParams = useCallback((updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => params.set(k, String(v)));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  const setSort = (v) => updateParams({ sort: v, page: 1 });
  const setPage = (fn) => updateParams({ page: typeof fn === "function" ? fn(page) : fn });
  const setPageSize = (v) => updateParams({ size: v, page: 1 });
  const setFilterType = (v) => updateParams({ filter: v, ftags: "", fletters: "", page: 1 });
  const clearFilter = () => updateParams({ filter: "all", ftags: "", fletters: "", page: 1 });
  const toggleFilterTag = (tag) => {
    const next = selectedTags.includes(tag) ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];
    updateParams({ ftags: next.join(","), page: 1 });
  };
  const toggleFilterLetter = (l) => {
    const next = selectedLetters.includes(l) ? selectedLetters.filter((x) => x !== l) : [...selectedLetters, l];
    updateParams({ fletters: next.join(","), page: 1 });
  };

  const [search, setSearch] = useState(searchValue);
  const [openDropdown, setOpenDropdown] = useState(null); // "sort" | "filter" | null
  const sortRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (sortRef.current?.contains(e.target)) return;
      if (filterRef.current?.contains(e.target)) return;
      setOpenDropdown(null);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

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

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;

  const filterActive = filterType !== "all";
  const filterCount = filterType === "tags" ? selectedTags.length : filterType === "letters" ? selectedLetters.length : 0;

  const poolFiltered = useMemo(() => {
    if (filterType === "tags" && selectedTags.length > 0)
      return words.filter((w) => (w.tags ?? []).some((t) => selectedTags.includes(t)));
    if (filterType === "letters" && selectedLetters.length > 0)
      return words.filter((w) => w.word?.[0] && selectedLetters.includes(w.word[0].toUpperCase()));
    return words;
  }, [words, filterType, selectedTags, selectedLetters]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return poolFiltered;
    return poolFiltered.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaningEn.toLowerCase().includes(q) ||
        (w.meaningBn && w.meaningBn.includes(q)) ||
        w.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [poolFiltered, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case "newest":
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest":
        return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "a-z":
        return list.sort((a, b) => a.word.localeCompare(b.word));
      case "z-a":
        return list.sort((a, b) => b.word.localeCompare(a.word));
      case "tags":
        return list; // handled separately below
      default:
        return list;
    }
  }, [filtered, sort]);

  useEffect(() => {
    if (searchValue !== search) {
      setSearch(searchValue);
      updateParams({ page: 1 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const listForPaging = sort === "tags" ? filtered : sorted;
  const totalPages = Math.max(1, Math.ceil(listForPaging.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pagedList = listForPaging.slice(startIndex, endIndex);

  const pagedGroupedByTag = useMemo(() => {
    if (sort !== "tags") return null;
    const groups = {};
    pagedList.forEach((w) => {
      if (w.tags.length === 0) {
        (groups["Untagged"] ??= []).push(w);
      } else {
        w.tags.forEach((t) => {
          (groups[t] ??= []).push(w);
        });
      }
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [pagedList, sort]);

  return (
    <>
      {!searchInHero && (
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
              updateParams({ page: 1 });
            }}
            placeholder="Search words, meanings, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-sm text-text placeholder:text-text-secondary/50"
          />
        </div>
      )}

      {/* Sort & Filter */}
      <div className="flex gap-2">
        {/* Sort dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setOpenDropdown((d) => (d === "sort" ? null : "sort"))}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              sort !== "newest"
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-surface-alt border border-border text-text-secondary hover:text-text hover:border-text-secondary"
            }`}
          >
            Sort{activeSortLabel ? `: ${activeSortLabel}` : ""}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`w-3 h-3 transition-transform duration-150 ${openDropdown === "sort" ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {openDropdown === "sort" && (
            <div className="absolute left-0 top-full mt-1.5 w-44 bg-surface border border-border rounded-xl shadow-lg z-20 overflow-hidden py-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setSort(opt.value); setOpenDropdown(null); }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm transition-colors ${
                    sort === opt.value
                      ? "text-primary font-medium bg-primary/5"
                      : "text-text-secondary hover:text-text hover:bg-surface-alt"
                  }`}
                >
                  {opt.label}
                  {sort === opt.value && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setOpenDropdown((d) => (d === "filter" ? null : "filter"))}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filterActive
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-surface-alt border border-border text-text-secondary hover:text-text hover:border-text-secondary"
            }`}
          >
            Filter{filterCount > 0 ? ` (${filterCount})` : ""}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`w-3 h-3 transition-transform duration-150 ${openDropdown === "filter" ? "rotate-180" : ""}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {openDropdown === "filter" && (
            <div className="absolute left-0 top-full mt-1.5 w-72 max-w-[85vw] max-h-96 overflow-y-auto bg-surface border border-border rounded-xl shadow-lg z-20 p-3 flex flex-col gap-3">
              {/* Word Pool */}
              <div className="flex flex-col gap-1.5">
                {FILTER_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      filterType === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="wordsFilterType"
                      value={opt.value}
                      checked={filterType === opt.value}
                      onChange={() => setFilterType(opt.value)}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${filterType === opt.value ? "border-primary" : "border-border"}`}>
                      {filterType === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{opt.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Tags selector */}
              {filterType === "tags" && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wide">
                    Select Tags
                    {selectedTags.length > 0 && (
                      <span className="normal-case ml-1 text-primary font-normal">
                        · {selectedTags.length} selected
                      </span>
                    )}
                  </p>
                  {allTags.length === 0 ? (
                    <p className="text-sm text-text-secondary py-2">No tags found.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                      {allTags.map((tag) => {
                        const checked = selectedTags.includes(tag);
                        const count = words.filter((w) => (w.tags ?? []).includes(tag)).length;
                        return (
                          <label
                            key={tag}
                            className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-surface-alt cursor-pointer transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-primary border-primary" : "border-border"}`}>
                              {checked && (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <input type="checkbox" checked={checked} onChange={() => toggleFilterTag(tag)} className="hidden" />
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
                        · {selectedLetters.length} selected
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
                          onClick={() => has && toggleFilterLetter(letter)}
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

              <div className="flex items-center justify-between pt-1 border-t border-border">
                <button
                  onClick={clearFilter}
                  disabled={!filterActive}
                  className="text-xs font-medium text-text-secondary hover:text-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setOpenDropdown(null)}
                  className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Count + Export */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">
          {filtered.length} word{filtered.length !== 1 ? "s" : ""}
          {search && ` matching "${search}"`}
        </p>
        <ExportButton words={words} />
      </div>

      {/* Word Cards */}
      {sort === "tags" && pagedGroupedByTag ? (
        <div className="flex flex-col gap-6">
          {pagedGroupedByTag.map(([tag, tagWords]) => (
            <div key={tag}>
              <h2 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                {tag}
                <span className="text-text-secondary font-normal">({tagWords.length})</span>
              </h2>
              <div className="flex flex-col gap-2">
                {tagWords.map((w) => (
                  <WordCard key={`${tag}-${w.id}`} word={w} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {pagedList.map((w) => (
            <WordCard key={w.id} word={w} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-text-secondary text-sm py-8">
          No words found.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {PAGE_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setPageSize(size)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                  pageSize === size
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/25"
                    : "bg-surface-alt border-border text-text-secondary hover:text-text hover:border-text-secondary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <span className="text-xs text-text-secondary">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-surface-alt border border-border text-text-secondary disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3.5 py-2 rounded-lg text-xs font-medium bg-surface-alt border border-border text-text-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function WordCard({ word }) {
  return (
    <Link
      href={`/words/${word.id}`}
      className="block p-4 rounded-xl bg-surface-alt border border-border hover:border-primary card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{word.word}</h3>
            {word.partOfSpeech && (
              <span className="text-xs text-text-secondary italic shrink-0">
                {word.partOfSpeech}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">
            {word.meaningEn}
          </p>
          {word.meaningBn && (
            <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">
              {word.meaningBn}
            </p>
          )}
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-secondary shrink-0 mt-1">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      {word.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {word.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
