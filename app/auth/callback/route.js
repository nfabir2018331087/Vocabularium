import { NextResponse } from "next/server";
import { getSupabaseServer } from "../../../lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/profile?migrating=true`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
