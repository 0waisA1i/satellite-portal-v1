import "server-only";
import { getServerSupabase } from "./supabase";
import { archetypeLabel } from "./archetypes";
import type { Client, Signal } from "./types";
import type { ApproachWindowRow, SignalRow } from "./database.types";

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
//   - no `trigger_label` / `why_now` / `signal_intelligence` -> derived from
//     summary + tier metadata
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

function mapRow(row: SignalRow, window?: ApproachWindowRow): Signal {
  const summary = sanitize(row.summary);
  const archetypeName = archetypeLabel(row.archetype);
  const actWithin = window?.days_until_stale != null
    ? Math.max(0, Math.round(window.days_until_stale))
    : 30; // GAP: no act-window source for signals without an approach_windows row

  return {
    signal_id: row.signal_id,
    archetype: archetypeName,
    account: {
      name: sanitize(row.company),
      sector: "", // GAP: sector lives at ICP level, not per signal
      geo: "", // GAP: geo lives at ICP level, not per signal
    },
    title: sanitize(row.title),
    // GAP: no trigger_label column. Surface the real tier metadata instead.
    trigger_label: [row.archetype_tier, row.priority_tier]
      .filter(Boolean)
      .join(" · "),
    why_now: summary ? firstSentence(summary) : "", // GAP: derived from summary
    summary,
    signal_intelligence: summary, // GAP: no dedicated field; reuse summary
    suggested_next_step: sanitize(row.next_step),
    target_titles: parseTargetTitles(row.target_persona),
    outreach_angle: "", // GAP: no outreach_angle column yet
    false_positive_filter: "", // GAP: lives in icp_configs.config, not per signal
    rank_boost_flags: row.boost_flags ?? [],
    confidence_current: row.current_confidence,
    // GAP: no deadline column. Use the view's optimal outreach date as a proxy.
    deadline_date: window?.optimal_outreach_date ?? row.last_seen,
    act_within_days: actWithin,
    est_volume: "", // GAP: no volume column
    status: (row.status as Signal["status"]) ?? "active",
    source_url: row.source_url ?? "",
    source_verified: false, // GAP: no source_verified column
    surfaced: true, // GAP: no surfaced flag; treat all as surfaced
    surfaced_period: "", // set by caller to the current period
    contacts: [], // GAP: no contacts table; enrichment not wired
  };
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
    accent: "lime", // GAP: no per-client accent column; default brand accent
  };

  const [{ data: rows, error: sigError }, { data: windows }] = await Promise.all([
    supabase
      .from("signals")
      .select("*")
      .eq("client_id", resolvedClientId)
      .order("current_confidence", { ascending: false }),
    supabase.from("approach_windows").select("*").eq("client_id", resolvedClientId),
  ]);
  if (sigError) throw new Error(`signals read failed: ${sigError.message}`);

  const windowBySignal = new Map<string, ApproachWindowRow>();
  for (const w of windows ?? []) {
    if (w.signal_id) windowBySignal.set(w.signal_id, w);
  }

  const signals = (rows ?? []).map((row) => {
    const mapped = mapRow(row, windowBySignal.get(row.signal_id));
    mapped.surfaced_period = currentPeriod;
    return mapped;
  });

  return { client, signals, currentPeriod };
}
