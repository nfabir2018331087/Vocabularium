import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      return NextResponse.redirect(`${origin}/profile?migrating=true`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`);
}
