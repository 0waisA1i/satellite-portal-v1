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
    .from("contacts" as any)
    .select("id, name, title, email, linkedin_url, is_primary")
    .eq("signal_id", signalUuid)
    .order("is_primary", { ascending: false });
  if (error) throw new Error(`contacts fetch failed: ${error.message}`);
  return (data ?? []) as unknown as EnrichedContact[];
}

// Restores an archived/expired signal back to active. Gated to h2oallegiant.
export async function restoreSignalAction(signalUuid: string): Promise<void> {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("satellite_client_id")?.value;
  if (clientId !== "h2oallegiant") return;

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("signals")
    .update({ status: "active" })
    .eq("id", signalUuid)
    .eq("client_id", clientId);
  if (error) throw new Error(`restore failed: ${error.message}`);
}

// Archives a signal using its uuid PK. Gated to h2oallegiant via cookie.
// Uses the service role client so RLS does not block the update.
export async function archiveSignalAction(signalUuid: string): Promise<void> {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("satellite_client_id")?.value;
  if (clientId !== "h2oallegiant") return;

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("signals")
    .update({ status: "archived" })
    .eq("id", signalUuid)
    .eq("client_id", clientId);
  if (error) throw new Error(`archive failed: ${error.message}`);
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
