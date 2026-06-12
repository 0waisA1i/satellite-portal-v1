// Standardized Stage 7 signal shape. Mirrors docs/sample_signals.json today;
// will be regenerated from the live Supabase schema when the DB is wired.

export type Tier = "feed" | "stack" | "command";

export interface Client {
  id: string;
  name: string;
  code: string;
  accent: AccentName;
}

export interface Subscription {
  tier: Tier;
  segment_limit: number;
  signal_cap: number | null; // null = unlimited
  enrich_enabled: boolean;
  outreach_enabled: boolean;
  slack_enabled: boolean;
  current_period: string; // '2026-06'
}

export interface Contact {
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
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

// What the server sends to the browser: contacts are stripped unless the
// subscription has enrich_enabled. Locked signals never appear here at all.
export type VisibleSignal = Omit<Signal, "contacts"> & {
  contacts: Contact[] | null;
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
  lockedCount: number;
  stats: FeedStats;
}
