"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";
import { useTheme } from "../components/ThemeProvider";
import { getLocalWords, clearLocalWords } from "../../lib/local-words";
import { migrateLocalWords } from "../actions/words";

const themeLabels = { light: "Light", dark: "Dark", system: "System" };
const themeIcons = {
  light: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  system: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

export default function ProfilePage() {
  const { user, isGuest, loading, signOut } = useAuth();
  const { theme, cycleTheme } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const [signingOut, setSigningOut] = useState(false);
  const migrationStarted = useRef(false);

  // Handle migration when user just signed up/logged in
  useEffect(() => {
    if (searchParams.get("migrating") === "true" && user && !isGuest && !migrationStarted.current) {
      migrationStarted.current = true;
      handleMigration();
    }
  }, [searchParams, user, isGuest]);

  async function handleMigration() {
    setMigrating(true);
    try {
      const localWords = await getLocalWords();
      const result = await migrateLocalWords(localWords);
      if (result.success) {
        await clearLocalWords();
        setMigrationResult({
          success: true,
          migrated: result.migrated,
          claimed: result.claimed,
        });
      } else {
        setMigrationResult({ error: result.error });
      }
    } catch {
      setMigrationResult({ error: "Migration failed unexpectedly" });
    }
    setMigrating(false);
    // Remove query param
    router.replace("/profile");
  }

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-20 h-20 rounded-full bg-surface-alt skeleton" />
          <div className="h-6 w-32 bg-surface-alt rounded-lg skeleton" />
          <div className="h-4 w-48 bg-surface-alt rounded skeleton" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-surface-alt rounded-xl skeleton" />
        ))}
      </div>
    );
  }

  // Guest state
  if (isGuest) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-20 h-20 rounded-full bg-surface-alt border-2 border-border flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-text-secondary">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Guest User</h1>
          <p className="text-sm text-text-secondary text-center">Browsing as guest</p>
        </div>

        {/* Warning alert */}
        <div className="mx-0 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-500">Local storage only</p>
              <p className="text-xs text-text-secondary mt-1">
                Your words are stored locally on this device. Sign up to sync across devices and keep them safe.
              </p>
            </div>
          </div>
        </div>

        {/* Auth buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/auth/signup"
            className="w-full py-3 rounded-2xl text-center font-semibold text-sm bg-primary text-white hover:opacity-90 transition-opacity"
          >
            Sign Up
          </Link>
          <Link
            href="/auth/login"
            className="w-full py-3 rounded-2xl text-center font-semibold text-sm bg-surface-alt border border-border text-text hover:border-primary transition-colors"
          >
            Log In
          </Link>
        </div>

        {/* Theme toggle */}
        <div className="mt-2">
          <button
            onClick={cycleTheme}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-alt border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-text-secondary">{themeIcons[theme]}</span>
              <span className="text-sm font-medium">Theme</span>
            </div>
            <span className="text-sm text-text-secondary">{themeLabels[theme]}</span>
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];
  const avatarUrl = user.user_metadata?.avatar_url;
  const initials = displayName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Migration banner */}
      {migrating && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-primary">Migrating your local words...</p>
          </div>
        </div>
      )}
      {migrationResult?.success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-emerald-500 shrink-0">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-500">Migration complete</p>
              <p className="text-xs text-text-secondary mt-0.5">
                {migrationResult.migrated > 0 && `${migrationResult.migrated} local word${migrationResult.migrated > 1 ? "s" : ""} moved to your account. `}
                {migrationResult.claimed > 0 && `${migrationResult.claimed} existing word${migrationResult.claimed > 1 ? "s" : ""} claimed.`}
                {migrationResult.migrated === 0 && migrationResult.claimed === 0 && "No words to migrate."}
              </p>
            </div>
          </div>
        </div>
      )}
      {migrationResult?.error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{migrationResult.error}</p>
        </div>
      )}

      {/* User info */}
      <div className="flex flex-col items-center gap-3 py-8">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">{initials}</span>
          </div>
        )}
        <h1 className="text-xl font-bold">{displayName}</h1>
        <p className="text-sm text-text-secondary">{user.email}</p>
      </div>

      {/* Theme toggle */}
      <button
        onClick={cycleTheme}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-alt border border-border hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-text-secondary">{themeIcons[theme]}</span>
          <span className="text-sm font-medium">Theme</span>
        </div>
        <span className="text-sm text-text-secondary">{themeLabels[theme]}</span>
      </button>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="w-full py-3 rounded-2xl text-center font-semibold text-sm bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
      >
        {signingOut ? "Signing out..." : "Sign Out"}
      </button>
    </div>
  );
}
