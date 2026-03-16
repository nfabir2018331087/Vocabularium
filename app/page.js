import { getSupabaseUser } from "../lib/supabase/server";
import { getWords } from "./actions/words";
import HomeContent from "./components/HomeContent";
import GuestHomeContent from "./components/GuestHomeContent";

export default async function Home() {
  const user = await getSupabaseUser();

  if (user) {
    const { words } = await getWords();
    return <HomeContent words={words || []} />;
  }

  return <GuestHomeContent />;
}
