import Link from "next/link";
import { getSupabaseUser } from "../../../lib/supabase/server";
import { getWord } from "../../actions/words";
import WordDetailContent from "./WordDetailContent";
import GuestWordDetail from "./GuestWordDetail";

export default async function WordDetail({ params }) {
  const { id } = await params;
  const user = await getSupabaseUser();

  if (!user) {
    return <GuestWordDetail id={id} />;
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

  return <WordDetailContent word={word} />;
}
