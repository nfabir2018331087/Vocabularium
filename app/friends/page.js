"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from "../actions/friends";
import { getFriendData, getWords } from "../../lib/data-client";
import { shareWord } from "../actions/share";
import Toast from "../components/Toast";
import { getCachedFriends, setCachedFriends, isFriendsFresh } from "../../lib/client-cache";

const PAGE_SIZE = 5;

function Avatar({ user, size = "md" }) {
  const initials = (user.name || user.email || "?").slice(0, 2).toUpperCase();
  const sz = size === "lg" ? "w-12 h-12 text-base" : "w-10 h-10 text-sm";
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt="" className={`${sz} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${sz} rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0`}>
      {initials}
    </div>
  );
}

function AddFriendModal({ onClose, onSent }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function handleSend() {
    setError(null);
    setLoading(true);
    const result = await sendFriendRequest(email);
    setLoading(false);
    if (result.error) setError(result.error);
    else onSent();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl mb-16 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-5">
          <h2 className="text-base font-semibold">Add Friend</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-secondary transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-5 pb-6">
          <p className="text-xs text-text-secondary mb-4">Enter their email address to send a request.</p>
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="friend@example.com"
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none text-sm"
          />
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          <div className="flex gap-3 mt-4">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-text-secondary hover:text-text transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !email.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareWordModal({ friend, onClose, onRemoved }) {
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(true);
  const [wordSearch, setWordSearch] = useState("");
  const [sharing, setSharing] = useState(null);
  const [result, setResult] = useState({}); // { [wordId]: "ok" | "err" }
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    getWords().then((res) => {
      setWords(res.words || []);
      setLoadingWords(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = wordSearch.toLowerCase().trim();
    if (!q) return words;
    return words.filter(
      (w) => w.word.toLowerCase().includes(q) || w.meaningEn.toLowerCase().includes(q)
    );
  }, [words, wordSearch]);

  async function handleShare(wordId) {
    setSharing(wordId);
    const res = await shareWord({ wordId, recipientEmail: friend.email });
    setSharing(null);
    setResult((prev) => ({ ...prev, [wordId]: res.error ? "err" : "ok" }));
  }

  async function handleRemove() {
    setRemoving(true);
    await removeFriend(friend.friendshipId);
    setRemoving(false);
    onRemoved();
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl mb-16 sm:mb-0 flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-3 sm:pt-5">
          <div>
            <h2 className="text-base font-semibold">Share a Word</h2>
            <p className="text-xs text-text-secondary">with {friend.name || friend.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-alt text-text-secondary transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={wordSearch}
              onChange={(e) => setWordSearch(e.target.value)}
              placeholder="Search your words..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-3 flex flex-col gap-2">
          {loadingWords ? (
            [1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl bg-surface-alt skeleton" />)
          ) : filtered.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-6">No words found.</p>
          ) : (
            filtered.map((word) => {
              const status = result[word.id];
              return (
                <button
                  key={word.id}
                  onClick={() => !status && handleShare(word.id)}
                  disabled={sharing === word.id || status === "ok"}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                    status === "ok"
                      ? "border-success/40 bg-success/5 opacity-70"
                      : status === "err"
                      ? "border-red-400/40 bg-red-500/5"
                      : "border-border bg-surface-alt hover:border-primary card-hover"
                  } disabled:cursor-default`}
                >
                  <p className="font-semibold text-sm">{word.word}</p>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{word.meaningEn}</p>
                  {status === "ok" && <p className="text-[11px] text-success mt-0.5">Shared!</p>}
                  {status === "err" && <p className="text-[11px] text-red-500 mt-0.5">Failed — already in inbox?</p>}
                  {sharing === word.id && <p className="text-[11px] text-text-secondary mt-0.5">Sharing...</p>}
                </button>
              );
            })
          )}
        </div>

        {/* Remove friend */}
        <div className="px-5 pb-5 pt-2 border-t border-border flex justify-center">
          {confirmRemove ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-secondary">Remove {friend.name || friend.email}?</span>
              <button
                onClick={() => setConfirmRemove(false)}
                className="text-sm font-medium text-text-secondary hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                {removing ? "Removing..." : "Confirm"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="text-sm text-text-secondary hover:text-red-500 transition-colors"
            >
              Remove from friend list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FriendsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [shareFriend, setShareFriend] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/profile");
  }, [user, authLoading, router]);

  async function load(force = false) {
    const userId = user?.id;
    const cached = getCachedFriends(userId);
    const fresh = cached && isFriendsFresh(userId, 2 * 60 * 1000);

    if (cached) {
      setRequests(cached.requests || []);
      setFriends(cached.friends || []);
      setLoading(false);
    }

    if (!fresh || force) {
      if (!cached) setLoading(true);
      const data = await getFriendData();
      setRequests(data.requests || []);
      setFriends(data.friends || []);
      setCachedFriends(userId, data);
      setLoading(false);
    }
  }

  useEffect(() => { if (user) load(); }, [user]);

  function showToast(msg, type = "success") {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAccept(id) {
    setActionId(id);
    await acceptFriendRequest(id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await load(true);
    setActionId(null);
    showToast("Friend request accepted!");
  }

  async function handleReject(id) {
    setActionId(id);
    await rejectFriendRequest(id);
    setRequests((prev) => { const next = prev.filter((r) => r.id !== id); setCachedFriends(user?.id, { requests: next, friends }); return next; });
    setActionId(null);
  }

  const filteredFriends = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return friends;
    return friends.filter(
      (f) =>
        (f.name || "").toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q)
    );
  }, [friends, search]);

  const totalPages = Math.max(1, Math.ceil(filteredFriends.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedFriends = filteredFriends.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  if (authLoading || (!user && !authLoading)) return null;

  const previewRequests = requests.slice(0, 2);

  return (
    <div className="flex flex-col gap-6 -mx-4 -mt-6">
      {/* Hero */}
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Friends</h1>
              <p className="text-white/75 mt-0.5 text-sm">Connect and grow together</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Add Friend
          </button>
        </div>

        {/* Search */}
        <div className="relative mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/15 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-sm text-white placeholder:text-white/60"
          />
        </div>
      </div>

      {/* Friend Requests Preview */}
      <div className="px-4">
        <div className="relative w-full p-4 rounded-2xl bg-surface-alt border border-border">
          {requests.length > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold">
              {requests.length}
            </span>
          )}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">Friend Requests</h2>
              <p className="text-xs text-text-secondary">People who want to connect</p>
            </div>
            <Link
              href="/friend-requests"
              className="text-xs text-primary font-medium inline-flex items-center gap-1"
            >
              View all
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-surface border border-border skeleton" />)}
            </div>
          ) : previewRequests.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-2">No pending requests.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {previewRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <Avatar user={req.sender} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{req.sender.name || req.sender.email}</p>
                    <p className="text-xs text-text-secondary truncate">{req.sender.email}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionId === req.id}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:text-text hover:border-text-secondary transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={actionId === req.id}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
              {requests.length > 2 && (
                <Link href="/friend-requests" className="text-center text-xs text-primary font-medium py-1">
                  +{requests.length - 2} more request{requests.length - 2 !== 1 ? "s" : ""}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Friends List */}
      <div className="px-4 pb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            My Friends {!loading && friends.length > 0 && `· ${friends.length}`}
          </h2>
          {search && (
            <p className="text-xs text-text-secondary">{filteredFriends.length} result{filteredFriends.length !== 1 ? "s" : ""}</p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-surface-alt border border-border skeleton" />)}
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="text-center py-10 text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-3 opacity-40">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            <p className="text-sm">{search ? "No friends match your search." : "No friends yet."}</p>
            {!search && <p className="text-xs mt-1">Send a request to get started!</p>}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {pagedFriends.map((friend) => {
                const wordCount = friend._count?.words ?? 0;
                const initials = (friend.name || friend.email || "?").slice(0, 2).toUpperCase();
                return (
                  <div key={friend.friendshipId} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-alt border border-border">
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0 text-base">
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{friend.name || friend.email}</p>
                      <p className="text-xs text-text-secondary truncate">{friend.email}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-primary">
                          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                        </svg>
                        <span className="text-xs text-text-secondary">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShareFriend(friend)}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-colors shrink-0"
                      title="Share a word"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredFriends.length > PAGE_SIZE && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xs text-text-secondary">Page {safePage} of {totalPages}</span>
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
        )}
      </div>

      {/* Add Friend Modal */}
      {showModal && (
        <AddFriendModal
          onClose={() => setShowModal(false)}
          onSent={() => { setShowModal(false); showToast("Friend request sent!"); }}
        />
      )}

      {/* Share Word Modal */}
      {shareFriend && (
        <ShareWordModal
          friend={shareFriend}
          onClose={() => setShareFriend(null)}
          onRemoved={() => {
            setShareFriend(null);
            showToast(`${shareFriend.name || shareFriend.email} removed from friends.`);
            load(true);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
