import { getSupabaseServer } from "../lib/supabase/server";
import { getWords } from "./actions/words";
import HomeContent from "./components/HomeContent";
import GuestHomeContent from "./components/GuestHomeContent";

export default async function Home() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { words } = await getWords();
    return <HomeContent words={words || []} />;
  }

  return <GuestHomeContent />;
}
