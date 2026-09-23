"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitFeedback } from "../../actions/feedback";
import Toast from "../../components/Toast";

const MAX_LEN = 3000;

export default function FeedbackPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    const result = await submitFeedback(text.trim());
    setSending(false);

    if (result.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }

    setToast({ message: "Thanks for the feedback!", type: "success" });
    setText("");
  }

  return (
    <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
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
            <h1 className="text-2xl font-bold text-white">Feedback</h1>
            <p className="text-sm text-white/75 mt-0.5">Tell us what&apos;s working, or what isn&apos;t</p>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="feedback" className="text-sm font-medium">
            Your feedback
          </label>
          <textarea
            id="feedback"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
            placeholder="Bugs, ideas, or anything else on your mind..."
            disabled={sending}
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50 resize-none"
          />
          <p className="text-xs text-text-secondary text-right">{text.length}/{MAX_LEN}</p>
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          {sending ? "Sending..." : "Send Feedback"}
        </button>
      </div>
    </div>
  );
}
