"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWords } from "../actions/words";
import { acceptSharedWord, markSharedWordSeen, removeSharedWord } from "../actions/share";
import { useAuth } from "./AuthProvider";
import { setCachedInbox, setCachedWords } from "../../lib/client-cache";
import { useTheme } from "./ThemeProvider";

const themeIcons = {
  light: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  dark: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  system: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

export default function HomeContent({ words, progress = {}, inbox = null, inboxUnread = 0, showInbox = true, onWordsRefresh }) {
  const { theme, cycleTheme } = useTheme();
  const { user } = useAuth();
  const [inboxItems, setInboxItems] = useState(Array.isArray(inbox) ? inbox : []);
  const [expandedId, setExpandedId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const wordCount = words?.length || 0;
  const recentWords = words?.slice(0, 3) || [];
  const testedCount = Object.keys(progress).length;
  const overallCorrect = Object.values(progress).reduce((sum, s) => sum + (s.tested - s.missed), 0);
  const overallTotal = Object.values(progress).reduce((sum, s) => sum + s.tested, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : 0;
  const unreadCount = inboxItems.filter((i) => i.isNew).length || inboxUnread;
  const inboxKey = Array.isArray(inbox)
    ? inbox.map((i) => `${i.id}:${i.isNew ? 1 : 0}`).join("|")
    : "";
  const inboxPreview = inboxItems.slice(0, 1);
  const updateInboxItems = (updater) => {
    setInboxItems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (user?.id) setCachedInbox(user.id, next);
      return next;
    });
  };

  const refreshWords = async () => {
    if (!user?.id) return;
    const result = await getWords();
    if (result?.words) {
      setCachedWords(user.id, result.words);
      if (typeof onWordsRefresh === "function") onWordsRefresh(result.words);
    }
  };

  useEffect(() => {
    if (!Array.isArray(inbox)) return;
    setInboxItems(inbox);
  }, [inboxKey, user?.id]);

  return (
    <div className="flex flex-col gap-6 -mx-4 -mt-6">
      {/* Hero Section */}
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl relative">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          className="absolute top-13 right-7 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-white/30 transition-colors"
          title={`Theme: ${theme}`}
        >
          {themeIcons[theme]}
        </button>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Vocabularium
        </h1>
        <p className="text-white/75 mt-1 text-sm">
          Your personal vault for newly found words
        </p>

        {/* Stats */}
        <div className="flex gap-3 mt-6">
          <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-2xl font-bold text-white">{wordCount}</p>
            <p className="text-xs text-white/70">Words stored</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-2xl font-bold text-white">{testedCount}</p>
            <p className="text-xs text-white/70">Words tested</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm text-center">
            <p className="text-2xl font-bold text-white">{overallPct}%</p>
            <p className="text-xs text-white/70">Accuracy</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <Link
          href="/add"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          <span className="text-sm font-semibold">Add Word</span>
        </Link>

        <Link
          href="/words"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-rose-400">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
          <span className="text-sm font-semibold">My Words</span>
        </Link>

        <Link
          href="/quiz"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-accent">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-sm font-semibold">Quiz</span>
        </Link>

        <Link
          href="/progress"
          className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-surface-alt border border-border card-hover hover:border-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-success">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <span className="text-sm font-semibold">Progress</span>
        </Link>
      </div>

      {/* Inbox */}
      {showInbox && (
      <div className="px-4">
        <div className="relative w-full p-4 rounded-2xl bg-surface-alt border border-border">
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
              {unreadCount}
            </span>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Inbox</h2>
              <p className="text-xs text-text-secondary">Shared words from others</p>
            </div>
            <Link href="/inbox" className="text-xs text-primary font-medium inline-flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {inboxItems.length === 0 ? (
            <div className="text-center mt-3 text-sm text-text-secondary">
              No shared words yet.
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {inboxPreview.map((item) => {
                const senderName = item.sender?.name || item.sender?.email || "Unknown sender";
                const isExpanded = expandedId === item.id;
                return (
                  <div key={item.id} className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{item.word}</p>
                        <p className="text-xs text-text-secondary truncate">{item.meaningEn}</p>
                        <p className="text-[11px] text-text-secondary mt-1">From: {senderName}</p>
                      </div>
                      <button
                        onClick={() => {
                          const next = isExpanded ? null : item.id;
                          setExpandedId(next);
                          if (!isExpanded && item.isNew) {
                            markSharedWordSeen(item.id);
                            updateInboxItems((prev) => prev.map((i) => (
                              i.id === item.id ? { ...i, isNew: false } : i
                            )));
                          }
                        }}
                        className="text-xs font-medium text-primary hover:text-primary-dark inline-flex items-center gap-1"
                      >
                        {isExpanded ? "Hide" : "View"}
                        {isExpanded ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <polyline points="18 15 12 9 6 15" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 text-xs text-text-secondary flex flex-col gap-2">
                        {item.partOfSpeech && (
                          <div>
                            <span className="text-text font-medium">Part of speech:</span> {item.partOfSpeech}
                          </div>
                        )}
                        <div>
                          <span className="text-text font-medium">Meaning:</span> {item.meaningEn}
                        </div>
                        {item.meaningBn && (
                          <div>
                            <span className="text-text font-medium">Bangla:</span> {item.meaningBn}
                          </div>
                        )}
                        {item.explanation && (
                          <div>
                            <span className="text-text font-medium">Explanation:</span> {item.explanation}
                          </div>
                        )}
                        {item.examples?.length > 0 && (
                          <div>
                            <span className="text-text font-medium">Examples:</span> {item.examples.join(" · ")}
                          </div>
                        )}
                        {item.tags?.length > 0 && (
                          <div>
                            <span className="text-text font-medium">Tags:</span> {item.tags.join(", ")}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            onClick={async () => {
                              setActionId(item.id);
                              setActionType("remove");
                              const result = await removeSharedWord(item.id);
                              if (!result?.error) {
                                updateInboxItems((prev) => prev.filter((i) => i.id !== item.id));
                              }
                              setActionId(null);
                              setActionType(null);
                            }}
                            disabled={actionId === item.id}
                            className="px-3 py-1.5 rounded-lg bg-surface-alt border border-border text-xs font-semibold text-text-secondary hover:text-text hover:border-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionId === item.id && actionType === "remove" ? "Removing..." : "Remove"}
                          </button>
                          <button
                            onClick={async () => {
                              setActionId(item.id);
                              setActionType("save");
                              const result = await acceptSharedWord(item.id);
                              if (!result?.error) {
                                updateInboxItems((prev) => prev.filter((i) => i.id !== item.id));
                                refreshWords();
                              }
                              setActionId(null);
                              setActionType(null);
                            }}
                            disabled={actionId === item.id}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionId === item.id && actionType === "save" ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {inboxItems.length > 0 && (
            <p className="text-center text-[11px] text-text-secondary mt-2">
              You have {inboxItems.length} word{inboxItems.length === 1 ? "" : "s"} in the inbox
            </p>
          )}
        </div>
      </div>
      )}

      {/* Recently Added */}
      {recentWords.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Recently Added
            </h2>
            <Link href="/words" className="text-xs text-primary font-medium inline-flex items-center gap-1">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentWords.map((w) => (
              <Link
                key={w.id}
                href={`/words/${w.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-alt border border-border card-hover hover:border-primary"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{w.word}</span>
                    {w.partOfSpeech && (
                      <span className="text-[10px] text-text-secondary italic px-1.5 py-0.5 rounded-full bg-surface border border-border">
                        {w.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {w.meaningEn}
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-text-secondary shrink-0 ml-2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-text-secondary px-4 pb-2">
        <p>Store, organize, and practice your vocabulary</p>
      </div>
    </div>
  );
}
