import "server-only";
import { getServerSupabase } from "./supabase";
import { archetypeLabel } from "./archetypes";
import type { Client, Signal, Tier } from "./types";
import type { SignalRow } from "./database.types";

// Live read layer: pulls rows from the introspected Supabase schema and maps
// them onto the UI's Signal shape. This is RENDERING ONLY. Tier gating (cap,
// locked count, contact stripping) stays in feed.ts.
//
// The live schema does NOT yet match the build spec. Fields the mockup needs
// that have no live column are filled with safe fallbacks and flagged below as
// GAP. None of these are invented data: where a value is unknown we leave it
// empty or derive it transparently from a real column.
//
// GAPS vs docs/Satellite_Portal_BuildSpec.md (raise with Owais):
//   - no `surfaced` / `surfaced_period`  -> all active signals treated as this
//     period's feed (cannot answer "the 5 we picked this month" from the DB)
//   - no `subscriptions` table            -> tier comes from the demo toggle;
//     icp_configs.config.tier ("Signal Feed") is the only live hint
//   - no `contacts` table                 -> contacts = [] (enrichment stubbed)
//   - no `accounts` entity                -> account.name = signals.company,
//     sector/geo unknown (live only has them at the ICP level, not per signal)
//   - no `outreach_angle` / `target_titles` -> parsed from `target_persona`
//   - no `trigger_label` / `signal_intelligence` -> derived from summary + tier metadata
//   - `why_now` and `outreach_angle` now read directly from the signals table
//   - no `deadline_date` / `act_within_days` / `est_volume` -> deadline and
//     act-window derived from the approach_windows view; est_volume unknown
//   - no `source_verified`                -> defaults false (no verified badge)

// "Primary: VP/Director EHS | Secondary: Compliance Counsel" -> [titles...]
function parseTargetTitles(persona: string | null): string[] {
  if (!persona) return [];
  return persona
    .split("|")
    .map((part) => part.replace(/^\s*(primary|secondary)\s*:\s*/i, "").trim())
    .filter(Boolean);
}

// Stage-7 source text occasionally arrives mojibake-encoded (UTF-8 read as
// Latin-1). Repair the common sequences. Em dashes become " - " because
// CLAUDE.md bans em dashes in user-facing copy.
function sanitize(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/â€”/g, " - ") // em dash
    .replace(/â€“/g, " - ") // en dash
    .replace(/â€™/g, "'") // right single quote
    .replace(/â€œ/g, '"') // left double quote
    .replace(/â€/g, '"') // right double quote
    .replace(/â€˜/g, "'") // left single quote
    .trim();
}

function firstSentence(text: string): string {
  const s = text.split(/(?<=[.!?])\s/)[0] ?? text;
  return s.length > 160 ? `${s.slice(0, 157)}...` : s;
}

function mapRow(row: SignalRow): Signal {
  const summary = sanitize(row.summary);
  const archetypeName = archetypeLabel(row.archetype);
  // Formula: (current_confidence - 50) / decay_rate * 7
  // The signal hits the 50-pt stale threshold after this many days from last_seen.
  // Negative values mean already stale; callers render these as "overdue".
  const actWithin = row.decay_rate > 0
    ? Math.round((row.current_confidence - 50) / row.decay_rate * 7)
    : 0;

  return {
    id: row.id,
    signal_id: row.signal_id,
    archetype: archetypeName,
    account: {
      name: sanitize(row.company),
      sector: "", // TODO: add sector/geo columns to signals table (currently only in icp_configs.config)
      geo: "",
    },
    title: sanitize(row.title),
    // TODO: add trigger_label column to signals; for now derive from archetype_tier + priority_tier
    trigger_label: [row.archetype_tier, row.priority_tier]
      .filter(Boolean)
      .join(" · "),
    why_now: row.why_now ?? "",
    summary,
    signal_intelligence: summary, // TODO: add signal_intelligence column to signals table
    suggested_next_step: sanitize(row.next_step),
    target_titles: parseTargetTitles(row.target_persona),
    outreach_angle: row.outreach_angle ?? "",
    false_positive_filter: "", // TODO: pull from icp_configs.config.false_positive_filters per signal archetype
    rank_boost_flags: row.boost_flags ?? [],
    confidence_current: row.current_confidence,
    deadline_date: new Date().toISOString().slice(0, 10),
    act_within_days: actWithin,
    est_volume: "", // TODO: add est_volume column to signals table (pipeline stage 7 output)
    status: (row.status as Signal["status"]) ?? "active",
    source_url: row.source_url ?? "",
    source_verified: false, // TODO: add source_verified boolean column to signals table
    first_seen: row.first_seen ?? undefined,
    surfaced_at: row.surfaced_at ?? null,
    enrichment_grade: row.enrichment_grade ?? null,
    send_date: row.send_date ?? null,
    draft_email: row.draft_email ?? null,
    surfaced_period: "", // set by caller to the current period
    contacts: [], // TODO: wire enrichment — query contacts table via fetchContactsForSignal
  };
}

// Reads tier and signal_cap from the subscriptions table. Falls back to preset
// caps when the DB row is missing so the app stays functional without a row.
const FALLBACK_SIGNAL_CAPS: Record<Tier, number> = { feed: 5, stack: 15, command: Infinity };

export async function fetchClientTier(
  clientId: string,
): Promise<{ tier: Tier; signal_cap: number }> {
  const supabase = getServerSupabase();
  const { data } = await supabase
    .from("subscriptions")
    .select("tier, signal_cap")
    .eq("client_id", clientId)
    .maybeSingle();
  const t: string = data?.tier ?? "";
  const tier: Tier = t === "signal_feed" ? "feed" : t === "signal_stack" ? "stack" : "command";
  return { tier, signal_cap: data?.signal_cap ?? FALLBACK_SIGNAL_CAPS[tier] };
}

export interface LiveFeed {
  client: Client;
  signals: Signal[];
  currentPeriod: string;
}

// Reads the client and its signals. When clientId is provided (post-login flow)
// the query is scoped to that client. Without it, falls back to the first seeded
// client — useful for local dev without auth wired up.
export async function fetchLiveFeed(clientId?: string): Promise<LiveFeed> {
  const supabase = getServerSupabase();
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const icpBase = supabase.from("icp_configs").select("client_id, client_name");
  const { data: icp, error: icpError } = await (
    clientId ? icpBase.eq("client_id", clientId) : icpBase.limit(1)
  ).single();
  if (icpError) throw new Error(`icp_configs read failed: ${icpError.message}`);

  const resolvedClientId = icp.client_id;
  const client: Client = {
    id: resolvedClientId,
    name: icp.client_name,
    code: resolvedClientId.slice(0, 3).toUpperCase(),
    accent: "lime", // TODO: add accent column to clients table (or icp_configs)
  };

  const { data: rows, error: sigError } = await supabase
    .from("signals")
    .select("*")
    .eq("client_id", resolvedClientId)
    .order("current_confidence", { ascending: false });
  if (sigError) throw new Error(`signals read failed: ${sigError.message}`);

  const signals = (rows ?? []).map((row) => {
    const mapped = mapRow(row);
    mapped.surfaced_period = currentPeriod;
    return mapped;
  });

  return { client, signals, currentPeriod };
}
