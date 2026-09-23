"use client";

import { useRouter } from "next/navigation";

const LINKS = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1-.02-1.96-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.21.66.8.55A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

export default function AboutUsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 pb-8 -mx-4 -mt-6">
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
            <h1 className="text-2xl font-bold text-white">About Us</h1>
            <p className="text-sm text-white/75 mt-0.5">Who&apos;s behind Vocabularium</p>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-6">
        {/* Profile card */}
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-surface-alt border border-border text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 via-violet-600 to-indigo-400 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            Y
          </div>
          <div>
            <p className="text-lg font-semibold">Your Name</p>
            <p className="text-sm text-text-secondary mt-1">
              Building Vocabularium in my spare time — placeholder bio, real one coming soon.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                title={link.label}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border text-text-secondary hover:text-primary hover:border-primary transition-colors"
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* App info blurb */}
        <div className="p-5 rounded-2xl bg-surface-alt border border-border flex flex-col gap-2">
          <p className="text-sm font-semibold">About Vocabularium</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Vocabularium is a personal vocabulary builder — save words with meanings, examples and tags,
            practice with quizzes, and use AI to help fill in details and turn your words into short
            stories. Placeholder text — a fuller description will go here.
          </p>
        </div>
      </div>
    </div>
  );
}
