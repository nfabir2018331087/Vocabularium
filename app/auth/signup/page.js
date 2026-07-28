"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";
import { getSupabaseBrowser } from "../../../lib/supabase/client";

export default function SignUp() {
  const router = useRouter();
  const { user, isGuest } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isGuest) router.replace("/profile");
  }, [user, isGuest, router]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailInUse, setEmailInUse] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleEmailSignUp(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailInUse(false);

    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/confirm`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      const message = error.message === "User already registered"
        ? "This email is already used. Try another one or log in instead."
        : error.message;
      setError(message);
      setEmailInUse(error.message === "User already registered");
      setLoading(false);
      return;
    }

    const existingUser = data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
    if (existingUser) {
      setError("This email is already used. Try another one or log in instead.");
      setEmailInUse(true);
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
  }

  async function handleGoogleSignUp() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    });
  }

  if (emailSent) {
    return (
      <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
        <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Check your email</h1>
              <p className="text-sm text-white/75 mt-0.5">Confirm your account to continue</p>
            </div>
          </div>
        </div>
        <div className="px-4 flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-success">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary max-w-xs">
            We sent a confirmation link to <strong className="text-text">{email}</strong>. Click the link to activate your account.
          </p>
          <Link href="/auth/login" className="text-primary text-sm font-medium mt-2">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
      <div className="hero-gradient px-6 pt-10 pb-8 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-sm text-white/75 mt-0.5">
              Sign up to sync your words across devices
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {/* Google OAuth */}
        <button
          onClick={handleGoogleSignUp}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl border border-border bg-surface-alt hover:border-primary transition-colors font-medium text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-text-secondary">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 px-4 py-2.5 rounded-xl">
              {error}
            </p>
          )}
          {emailInUse && (
            <div className="text-xs text-text-secondary px-2">
              <span>Use a different email or </span>
              <Link href={`/auth/login?email=${encodeURIComponent(email)}`} className="text-primary font-medium">
                log in with this email
              </Link>
              .
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-surface-alt border border-border focus:border-primary focus:outline-none transition-colors text-text placeholder:text-text-secondary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M17.94 17.94A10.94 10.94 0 0112 20C7 20 2.73 16.11 1 12c.67-1.61 1.72-3.09 3.06-4.35" />
                    <path d="M9.9 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.89 11 8-1.01 2.43-2.78 4.5-5.06 5.94" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M9.9 9.9a3 3 0 004.2 4.2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 active:scale-[0.98]"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
