import { getSupabaseUser } from "../../lib/supabase/server";
import { getWords } from "../actions/words";
import { getWordProgress } from "../actions/quiz";
import ProgressPageContent from "./ProgressPageContent";
import GuestProgressPage from "./GuestProgressPage";

export default async function Progress() {
  const user = await getSupabaseUser();

  if (user) {
    const [{ words }, { progress }] = await Promise.all([
      getWords(),
      getWordProgress(),
    ]);
    return <ProgressPageContent words={words || []} progress={progress} />;
  }

  return <GuestProgressPage />;
}
