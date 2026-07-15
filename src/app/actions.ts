"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase";
import { archetypeLabel } from "@/lib/archetypes";

// Rows returned for the Contacts sheet in the Excel export.
// Joined server-side so the client never needs its own Supabase query.
export interface ExportContactRow {
  company: string;
  signal_id: string;  // human-readable text code e.g. "KAT-001"
  archetype: string;  // resolved label, not raw code
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
}

export async function fetchContactsForExport(): Promise<ExportContactRow[]> {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("satellite_client_id")?.value;
  if (!clientId) return [];

  const supabase = getServerSupabase();

  // Pull all signals for this client so we can join company/signal_id/archetype.
  const { data: signals, error: sigError } = await supabase
    .from("signals")
    .select("id, signal_id, company, archetype")
    .eq("client_id", clientId);
  if (sigError || !signals?.length) return [];

  const sigMap = new Map((signals as any[]).map((s) => [s.id as string, s as any]));
  const signalIds = (signals as any[]).map((s) => s.id as string);

  const { data: contacts, error: conError } = await (supabase as any)
    .from("contacts")
    .select("name, title, email, linkedin_url, signal_id")
    .in("signal_id", signalIds);
  if (conError) throw new Error(`contacts export fetch failed: ${conError.message}`);

  return ((contacts ?? []) as any[]).map((c) => {
    const sig = sigMap.get(c.signal_id as string);
    return {
      company: sig?.company ?? "",
      signal_id: sig?.signal_id ?? "",
      archetype: archetypeLabel(sig?.archetype ?? ""),
      name: c.name ?? "",
      title: c.title ?? "",
      email: c.email ?? "",
      linkedin_url: c.linkedin_url ?? "",
    };
  });
}

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

// Restores an archived/expired signal back to active. Gated to tab-view clients.
export async function restoreSignalAction(signalUuid: string): Promise<void> {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("satellite_client_id")?.value;
  if (
    clientId !== "h2oallegiant" &&
    clientId !== "gridvest" &&
    clientId !== "cleantechgrowthlab" &&
    clientId !== "ensights"
  ) return;

  const supabase = getServerSupabase();
  const { error } = await supabase
    .from("signals")
    .update({ status: "active" })
    .eq("id", signalUuid)
    .eq("client_id", clientId);
  if (error) throw new Error(`restore failed: ${error.message}`);
}

// Archives a signal using its uuid PK. Gated to tab-view clients via cookie.
// Uses the service role client so RLS does not block the update.
export async function archiveSignalAction(signalUuid: string): Promise<void> {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("satellite_client_id")?.value;
  if (
    clientId !== "h2oallegiant" &&
    clientId !== "gridvest" &&
    clientId !== "cleantechgrowthlab" &&
    clientId !== "ensights"
  ) return;

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
