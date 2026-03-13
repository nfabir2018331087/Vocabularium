import { getSupabaseServer } from "../../lib/supabase/server";
import { getWords } from "../actions/words";
import QuizPageContent from "./QuizPageContent";
import GuestQuizPage from "./GuestQuizPage";

export default async function QuizPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { words } = await getWords();
    return <QuizPageContent words={words || []} isGuest={false} />;
  }

  return <GuestQuizPage />;
}
