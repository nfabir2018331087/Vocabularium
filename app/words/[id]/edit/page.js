import Link from "next/link";
import { getSupabaseUser } from "../../../../lib/supabase/server";
import { getWord } from "../../../actions/words";
import EditForm from "./EditForm";
import GuestEditPage from "./GuestEditPage";

export default async function EditWord({ params }) {
  const { id } = await params;
  const user = await getSupabaseUser();

  if (!user) {
    return <GuestEditPage id={id} />;
  }

  const { word, error } = await getWord(id);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-red-400">{error}</p>
        <Link href="/words" className="text-primary font-medium text-sm">
          Back to words
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <Link href={`/words/${word.id}`} replace className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Word</h1>
        <p className="text-sm text-text-secondary mt-0.5">Editing &ldquo;{word.word}&rdquo;</p>
      </div>
      <EditForm word={word} />
    </div>
  );
}
