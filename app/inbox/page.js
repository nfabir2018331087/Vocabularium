"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { acceptSharedWord, markSharedWordSeen, removeSharedWord } from "../actions/share";
import { getInbox } from "../../lib/data-client";
import { getCachedInbox, isInboxFresh, setCachedInbox, setCachedWords } from "../../lib/client-cache";
import { getWords } from "../../lib/data-client";

const INBOX_TTL_MS = 2 * 60 * 1000;

function InboxLoading() {
  return (
    <div className="flex flex-col gap-4 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="h-7 w-32 bg-white/20 rounded-lg" />
        <div className="h-4 w-56 bg-white/10 rounded mt-2" />
      </div>
      <div className="px-4 flex flex-col gap-2 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-surface-alt rounded-xl skeleton" />
        ))}
      </div>
    </div>
  );
}

export default function InboxPage() {
  const { loading, isGuest, user } = useAuth();
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const updateItems = (updater) => {
    setItems((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (user?.id) setCachedInbox(user.id, next);
      return next;
    });
  };

  useEffect(() => {
    let alive = true;
    if (loading || isGuest) return;
    const cached = getCachedInbox(user?.id);
    const fresh = cached && isInboxFresh(user?.id, INBOX_TTL_MS);
    if (cached) {
      updateItems(cached);
      setLoadingInbox(false);
    }
    if (!fresh) {
      getInbox().then(({ inbox }) => {
        if (!alive) return;
        const nextItems = inbox || [];
        updateItems(nextItems);
        setLoadingInbox(false);
      });
    }
    return () => { alive = false; };
  }, [loading, isGuest, user?.id]);

  if (loading) return <InboxLoading />;
  if (isGuest) {
    return (
      <div className="flex flex-col gap-4 -mx-4 -mt-6 pb-8">
        <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
          <h1 className="text-2xl font-bold text-white">Inbox</h1>
          <p className="text-sm text-white/75 mt-0.5">Sign in to receive shared words</p>
        </div>
        <div className="px-4">
          <p className="text-sm text-text-secondary">Create an account or sign in to use inbox sharing.</p>
          <Link href="/auth/login" className="text-primary font-medium text-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }
  if (loadingInbox) return <InboxLoading />;

  return (
    <div className="flex flex-col gap-4 -mx-4 -mt-6 pb-8">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Inbox</h1>
            <p className="text-sm text-white/75 mt-0.5">
              You have {items.length} word{items.length === 1 ? "" : "s"} shared with you
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-2 mt-1">
        {items.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="text-text-secondary text-sm">No shared words yet.</p>
            <Link href="/" className="text-primary font-medium text-sm">Back to Home</Link>
          </div>
        ) : (
          items.map((item) => {
            const senderName = item.sender?.name || item.sender?.email || "Unknown sender";
            const isExpanded = expandedId === item.id;
            return (
              <div key={item.id} className="rounded-xl border border-border bg-surface-alt p-3">
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
                        updateItems((prev) => prev.map((i) => (
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
                            updateItems((prev) => prev.filter((i) => i.id !== item.id));
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
                            updateItems((prev) => prev.filter((i) => i.id !== item.id));
                            if (user?.id) {
                              getWords().then(({ words }) => {
                                if (words) setCachedWords(user.id, words);
                              }).catch(() => {});
                            }
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
          })
        )}
      </div>
    </div>
  );
}
