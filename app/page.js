import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pt-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Vocabularium</h1>
        <p className="text-text-secondary mt-2">Your personal vocabulary builder</p>
      </div>

      <div className="grid gap-4">
        <Link
          href="/add"
          className="flex items-center gap-4 p-5 rounded-2xl bg-surface-alt border border-border hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold">Add New Word</h2>
            <p className="text-sm text-text-secondary">Save a word with meaning & examples</p>
          </div>
        </Link>

        <Link
          href="/words"
          className="flex items-center gap-4 p-5 rounded-2xl bg-surface-alt border border-border hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold">My Words</h2>
            <p className="text-sm text-text-secondary">Browse & manage your vocabulary</p>
          </div>
        </Link>

        <Link
          href="/quiz"
          className="flex items-center gap-4 p-5 rounded-2xl bg-surface-alt border border-border hover:border-primary transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold">Quiz</h2>
            <p className="text-sm text-text-secondary">Test your knowledge</p>
          </div>
        </Link>
      </div>

      <div className="text-center text-xs text-text-secondary mt-4">
        <p>Bangla & English vocabulary tracker</p>
      </div>
    </div>
  );
}
