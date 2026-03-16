import { getSupabaseUser } from "../../lib/supabase/server";
import { getWords } from "../actions/words";
import WordsPageContent from "./WordsPageContent";
import GuestWordsPage from "./GuestWordsPage";

export default async function Words() {
  const user = await getSupabaseUser();

  if (user) {
    const { words, error } = await getWords();
    return <WordsPageContent words={words} error={error} />;
  }

  return <GuestWordsPage />;
}
