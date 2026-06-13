// Generated from the LIVE Supabase schema (project vrxgpqezcfoqvdvtrtau, public schema)
// via the PostgREST OpenAPI definition on 2026-06-13. Introspected, not hand-written.
//
// This is the data contract as it exists today. It does NOT yet match the proposed
// schema in docs/Satellite_Portal_BuildSpec.md or the UI shape in src/lib/types.ts.
// See the gap list in that mapping work before wiring the Feed to live reads.
//
// Only four objects are exposed in `public`: signals, icp_configs, scan_runs (tables)
// and approach_windows (a view). There is no clients, subscriptions, accounts, or
// contacts table yet.

export type SignalRow = {
  id: string; // uuid, pk
  client_id: string; // text, e.g. "kathairos" (NOT a uuid FK to a clients table)
  signal_id: string; // text, e.g. "KAT-001"
  archetype: string; // text, coded: "A1" | "A2" | "A4" (not human-readable names)
  archetype_tier: string; // text, "Gold" | "Silver" (Bronze proposed, not yet seen)
  title: string;
  company: string; // text free-form (NOT normalized to an accounts entity)
  summary: string | null;
  source_url: string | null;
  target_persona: string | null; // single blended text blob, e.g. "Primary: ... | Secondary: ..."
  next_step: string | null;
  boost_flags: string[] | null;
  expansion_flag: boolean | null;
  initial_confidence: number; // int
  current_confidence: number; // int, live score after weekly decay
  decay_rate: number; // int, points/week. Gold=2, Silver=4, Bronze=6
  status: string; // text, observed: "active"
  priority_tier: string | null; // text, "Tier 1" | "Tier 2" | "Tier 3"
  first_seen: string; // date
  last_seen: string; // date
  last_decay_applied: string | null; // timestamptz
  scan_count: number; // int
  notes: string | null;
  created_at: string | null; // timestamptz
  updated_at: string | null; // timestamptz
}

export type IcpConfigRow = {
  id: string; // uuid, pk
  client_id: string; // text short code, e.g. "kathairos"
  client_name: string; // e.g. "Kathairos Solutions"
  domain: string | null; // e.g. "kathairos.com"
  version: number; // int
  status: string; // text, e.g. "locked"
  config: Record<string, unknown>; // jsonb: sectors, geos, personas, archetypes, false-positive filters
  locked_at: string | null; // timestamptz
  created_at: string | null; // timestamptz
  updated_at: string | null; // timestamptz
}

export type ScanRunRow = {
  id: string; // uuid, pk
  client_id: string; // text
  run_date: string; // date
  triggered_by: string; // text
  status: string; // text
  signals_found: number | null;
  signals_new: number | null;
  signals_refreshed: number | null;
  signals_decayed: number | null;
  approved_by: string | null;
  notes: string | null;
  created_at: string | null; // timestamptz
}

// View: derived urgency / approach-window fields computed off signals.
// No primary key; read-only. Useful for the mockup's "Act in X days" pill.
export type ApproachWindowRow = {
  client_id: string | null;
  signal_id: string | null;
  company: string | null;
  title: string | null;
  archetype_tier: string | null;
  priority_tier: string | null;
  current_confidence: number | null;
  status: string | null;
  last_seen: string | null; // date
  decay_rate: number | null;
  days_until_stale: number | null; // numeric
  days_until_expired: number | null; // numeric
  approach_urgency: string | null; // e.g. "Act this week"
  optimal_outreach_date: string | null; // date
}

// Shaped to satisfy supabase-js's GenericSchema (mirrors `supabase gen types`
// output: tables need Row/Insert/Update/Relationships, views need Row, and the
// schema needs Functions/Enums/CompositeTypes). The portal only reads, so
// Insert/Update mirror Row.
export interface Database {
  public: {
    Tables: {
      signals: {
        Row: SignalRow;
        Insert: SignalRow;
        Update: Partial<SignalRow>;
        Relationships: [];
      };
      icp_configs: {
        Row: IcpConfigRow;
        Insert: IcpConfigRow;
        Update: Partial<IcpConfigRow>;
        Relationships: [];
      };
      scan_runs: {
        Row: ScanRunRow;
        Insert: ScanRunRow;
        Update: Partial<ScanRunRow>;
        Relationships: [];
      };
    };
    Views: {
      approach_windows: { Row: ApproachWindowRow; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
