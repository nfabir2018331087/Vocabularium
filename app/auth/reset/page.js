"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "../../../lib/supabase/client";

export default function ResetPassword() {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data?.session);
      setLoading(false);
    });
  }, []);

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    setSuccess(true);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="h-6 w-32 bg-surface-alt rounded-lg skeleton" />
        <div className="h-4 w-48 bg-surface-alt rounded skeleton" />
        <div className="h-12 bg-surface-alt rounded-xl skeleton" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-text-secondary">
          This link is invalid or expired. Please request a new one.
        </p>
        <Link href="/auth/login" className="text-primary font-medium text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <h1 className="text-2xl font-bold">Password updated</h1>
        <p className="text-sm text-text-secondary">
          You can now log in with your new password.
        </p>
        <Link href="/auth/login" className="text-primary font-medium text-sm">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-4">
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 px-4 py-2.5 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">New password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm" className="text-sm font-medium">Confirm password</label>
          <input
            id="confirm"
            type="password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
