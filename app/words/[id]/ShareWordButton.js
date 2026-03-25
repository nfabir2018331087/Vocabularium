"use client";

import { useState } from "react";
import Toast from "../../components/Toast";
import { shareWord } from "../../actions/share";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ShareWordButton({ wordId }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl bg-surface-alt border border-border hover:border-primary text-text-secondary hover:text-primary transition-colors"
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
              Enter the recipient’s email to send this word.
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <label htmlFor="shareEmail" className="text-sm font-medium">
                Recipient email
              </label>
              <input
                id="shareEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
