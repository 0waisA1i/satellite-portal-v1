// Standardized Stage 7 signal shape. Mirrors docs/sample_signals.json today;
// will be regenerated from the live Supabase schema when the DB is wired.

export type Tier = "feed" | "stack" | "command";

export interface Client {
  id: string;
  name: string;
  code: string;
  accent: AccentName;
}

// One unified "Signal Satellite" view for every plan. The plan gates which
// FEATURES are unlocked, not which signals are visible.
export interface Subscription {
  tier: Tier;
  signal_cap: number; // max signals surfaced to the client; Infinity = no cap
  segment_limit: number;
  enrich_enabled: boolean; // can reveal named contacts
  outreach_enabled: boolean; // can generate outreach
  crm_enabled: boolean; // can push to CRM
  current_period: string; // '2026-06'
}

export interface Contact {
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
  enriched?: boolean; // set true once enrichment has run (later version)
}

export interface Account {
  name: string;
  sector: string;
  geo: string;
}

export interface Signal {
  signal_id: string;
  archetype: string;
  account: Account;
  title: string;
  trigger_label: string;
  why_now: string;
  summary: string;
  signal_intelligence: string;
  suggested_next_step: string;
  target_titles: string[];
  outreach_angle: string;
  false_positive_filter: string;
  rank_boost_flags: string[];
  confidence_current: number;
  deadline_date: string;
  act_within_days: number;
  est_volume: string;
  status: "active" | "stale" | "expired";
  source_url: string;
  source_verified: boolean;
  surfaced: boolean;
  surfaced_period: string;
  contacts: Contact[];
}

export type AccentName = "lime" | "mint" | "cyan" | "grey";

// What the server sends to the browser for one decision-maker. The title is
// always safe to show; name/email/linkedin are null until the contact is
// enriched (and the plan allows it), so PII never ships ungated.
export interface VisibleContact {
  title: string;
  enriched: boolean;
  name: string | null;
  email: string | null;
  linkedin_url: string | null;
}

export type VisibleSignal = Omit<Signal, "contacts"> & {
  contacts: VisibleContact[];
};

export interface FeedStats {
  total: number;
  active: number;
  avgConfidence: number;
}

export interface GatedFeed {
  client: Client;
  subscription: Subscription;
  signals: VisibleSignal[];
  // Next up to 3 signals beyond the cap, contacts stripped. Used to render
  // blurred teaser cards without leaking any gated content to the browser.
  teaserSignals: VisibleSignal[];
  stats: FeedStats;
}
