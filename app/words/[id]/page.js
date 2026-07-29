import { getSupabaseUser } from "../../../lib/supabase/server";
import WordDetailLoader from "./WordDetailLoader";
import GuestWordDetail from "./GuestWordDetail";

export default async function WordDetail({ params }) {
  const { id } = await params;
  const user = await getSupabaseUser();

  if (!user) {
    return <GuestWordDetail id={id} />;
  }

  return <WordDetailLoader key={id} id={id} />;
}
