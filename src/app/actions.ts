"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";

export interface EnrichedContact {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  is_primary: boolean | null;
}

export async function fetchContactsForSignal(
  signalUuid: string,
): Promise<EnrichedContact[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, title, email, linkedin_url, is_primary")
    .eq("signal_id", signalUuid)
    .order("is_primary", { ascending: false });
  if (error) throw new Error(`contacts fetch failed: ${error.message}`);
  return (data ?? []) as EnrichedContact[];
}

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
  cookieStore.delete("satellite_user_email");
  redirect("/login");
}
