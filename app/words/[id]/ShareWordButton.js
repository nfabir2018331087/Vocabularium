"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Toast from "../../components/Toast";
import { shareWord } from "../../actions/share";
import { getFriendData } from "../../actions/friends";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ShareWordButton({ wordId }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendSearch, setFriendSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setFriendsLoading(true);
    getFriendData().then((data) => {
      setFriends(data.friends || []);
      setFriendsLoading(false);
    });
  }, [open]);

  useEffect(() => {
    if (!open) { setEmail(""); setFriendSearch(""); setShowDropdown(false); }
  }, [open]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredFriends = useMemo(() => {
    const q = friendSearch.toLowerCase().trim();
    if (!q) return friends;
    return friends.filter(
      (f) => (f.name || "").toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
    );
  }, [friends, friendSearch]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl bg-white/15 border border-white/20 hover:bg-white/25 text-white transition-colors"
        title="Share"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !loading && setOpen(false)}
          />
          <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Share word</h3>
            <p className="text-sm text-text-secondary mt-1">
              Enter the recipient's email to send this word.
            </p>

            {/* Friend picker */}
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-sm font-medium">Choose from friends</label>
              <div ref={dropdownRef} className="relative">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    value={friendSearch}
                    onChange={(e) => { setFriendSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search friends..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none text-sm"
                    disabled={loading}
                  />
                </div>
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg z-10 max-h-36 overflow-y-auto">
                    {friendsLoading ? (
                      <p className="text-xs text-text-secondary text-center py-3">Loading friends...</p>
                    ) : filteredFriends.length === 0 ? (
                      <p className="text-xs text-text-secondary text-center py-3">No friends found.</p>
                    ) : (
                      filteredFriends.map((f) => (
                        <button
                          key={f.friendshipId}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setEmail(f.email);
                            setFriendSearch(f.name || f.email);
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-surface-alt text-left transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                            {(f.name || f.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{f.name || f.email}</p>
                            {f.name && <p className="text-xs text-text-secondary truncate">{f.email}</p>}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Email input */}
            <div className="mt-3 flex flex-col gap-1.5">
              <label htmlFor="shareEmail" className="text-sm font-medium">
                Recipient email
              </label>
              <input
                id="shareEmail"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFriendSearch(""); }}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
                disabled={loading}
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-surface-alt border border-border text-sm font-semibold text-text-secondary hover:text-text hover:border-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const nextEmail = email.trim();
                  if (!isValidEmail(nextEmail)) {
                    setToast({ message: "Enter a valid email.", type: "error" });
                    return;
                  }
                  setLoading(true);
                  const result = await shareWord({ wordId, recipientEmail: nextEmail });
                  if (result?.error) {
                    setToast({ message: result.error, type: "error" });
                    setLoading(false);
                    return;
                  }
                  setToast({ message: "Word shared successfully." });
                  setLoading(false);
                  setEmail("");
                  setFriendSearch("");
                  setOpen(false);
                }}
                disabled={!email.trim() || loading}
                className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
