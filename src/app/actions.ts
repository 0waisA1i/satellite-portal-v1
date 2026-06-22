"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";

export async function signOutAction() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("satellite_user_id")?.value;

  if (userId) {
    try {
      const supabase = getServerSupabase();
      await supabase.auth.admin.signOut(userId);
    } catch {
      // Best-effort: clear local session regardless of whether the server-side
      // invalidation succeeds (e.g. token already expired).
    }
  }

  cookieStore.delete("satellite_client_id");
  cookieStore.delete("satellite_user_id");
  redirect("/login");
}
