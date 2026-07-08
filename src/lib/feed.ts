import "server-only";
import type {
  Client,
  Contact,
  GatedFeed,
  Signal,
  Subscription,
  Tier,
  VisibleContact,
  VisibleSignal,
} from "./types";
import sample from "../../docs/sample_signals.json";
import { hasSupabaseEnv } from "./supabase";
import { fetchLiveFeed } from "./live";

// Plan presets mirror the future `subscriptions` table (BuildSpec section 4).
// The product is a single "Signal Satellite" view: every plan sees all surfaced
// signals, and the plan only decides which feature actions are unlocked. When a
// real entitlements table exists, the row for the logged-in client replaces
// this and the demo plan toggle goes away. The live DB has no subscriptions
// table yet (only icp_configs.config.tier as a hint), so the demo toggle still
// drives gating even against live data.
const TIER_PRESETS: Record<Tier, Omit<Subscription, "current_period">> = {
  feed: {
    tier: "feed",
    signal_cap: 5,
    segment_limit: 1,
    enrich_enabled: false,
    outreach_enabled: false,
    crm_enabled: false,
  },
  stack: {
    tier: "stack",
    signal_cap: 15,
    segment_limit: 2,
    enrich_enabled: true,
    outreach_enabled: true,
    crm_enabled: false,
  },
  command: {
    tier: "command",
    signal_cap: Infinity,
    segment_limit: 4,
    enrich_enabled: true,
    outreach_enabled: true,
    crm_enabled: true,
  },
};

export const PLAN_LABELS: Record<Tier, string> = {
  feed: "Signal Feed",
  stack: "Signal Stack",
  command: "Signal Command",
};

export function isTier(value: string | undefined): value is Tier {
  return value === "feed" || value === "stack" || value === "command";
}

// Reduce a stored contact to what may leave the server. Titles are always
// safe. Name/email/linkedin are revealed only when the contact has been
// enriched AND the plan allows enrichment, so ungated PII never reaches the
// browser. Enrichment itself is a later version, so today this returns titles
// only on every plan.
function maskContact(c: Contact, sub: Subscription): VisibleContact {
  const reveal = sub.enrich_enabled && c.enriched === true;
  return {
    title: c.title,
    enriched: reveal,
    name: reveal ? c.name : null,
    email: reveal ? c.email : null,
    linkedin_url: reveal ? c.linkedin_url : null,
  };
}

// The critical rule: gating happens here, on the server, before anything is
// serialized to the browser. Every plan sees all surfaced signals for the
// period (single view), but contact PII is masked per the plan. With live
// Supabase this is still the place that enforces the contact mask; RLS will add
// tenant isolation once auth maps a login to a client_id.
function gate(
  client: Client,
  allSignals: Signal[],
  subscription: Subscription,
): GatedFeed {
  const qualified = allSignals
    .filter(
      (s) =>
        s.surfaced &&
        s.surfaced_period === subscription.current_period &&
        s.status !== "expired",
    )
    .sort((a, b) => b.confidence_current - a.confidence_current);

  const capped = qualified.slice(0, subscription.signal_cap);

  const signals: VisibleSignal[] = capped.map(({ contacts, ...rest }) => ({
    ...rest,
    contacts: contacts.map((c) => maskContact(c, subscription)),
  }));

  const teaserSignals: VisibleSignal[] = qualified
    .slice(subscription.signal_cap, subscription.signal_cap + 1)
    .map(({ contacts: _contacts, ...rest }) => ({ ...rest, contacts: [] }));

  return {
    client,
    subscription,
    signals,
    teaserSignals,
    stats: {
      total: qualified.length,
      active: qualified.filter((s) => s.status === "active").length,
      avgConfidence: Math.round(
        qualified.reduce((a, s) => a + s.confidence_current, 0) /
          Math.max(qualified.length, 1),
      ),
    },
  };
}

// Historical view: all expired signals for the client, no cap, no teaser.
// "Archived" signals are stored as expired in the current schema (the DB check
// constraint only allows active/stale/expired; 'archived' requires a migration).
function gateHistorical(
  client: Client,
  allSignals: Signal[],
  subscription: Subscription,
): GatedFeed {
  const historical = allSignals
    .filter((s) => s.status === "expired")
    .sort((a, b) => b.confidence_current - a.confidence_current);

  const signals: VisibleSignal[] = historical.map(
    ({ contacts: _c, ...rest }) => ({ ...rest, contacts: [] }),
  );

  return {
    client,
    subscription,
    signals,
    teaserSignals: [],
    stats: {
      total: historical.length,
      active: 0,
      avgConfidence: Math.round(
        historical.reduce((a, s) => a + s.confidence_current, 0) /
          Math.max(historical.length, 1),
      ),
    },
  };
}

export async function getHistoricalFeed(
  tier: Tier,
  opts: { clientId?: string } = {},
): Promise<GatedFeed> {
  const { clientId } = opts;

  if (hasSupabaseEnv && clientId) {
    const { client, signals, currentPeriod } = await fetchLiveFeed(clientId);
    const subscription: Subscription = {
      ...TIER_PRESETS[tier],
      current_period: currentPeriod,
    };
    return gateHistorical(client, signals, subscription);
  }

  const data = sample as unknown as {
    client: Client;
    subscription: Subscription;
    signals: Signal[];
  };
  const subscription: Subscription = {
    ...TIER_PRESETS[tier],
    current_period: data.subscription.current_period,
  };
  return gateHistorical(data.client, data.signals, subscription);
}

// Reads from live Supabase when env is configured, otherwise the sample JSON.
// `source` forces the choice: "demo" always uses the bundled sample (so the
// /demo route works on Vercel even with live env set); "auto" prefers live and
// falls back to sample. Either way the same server-side gating runs.
// `clientId` scopes the live read to a specific client (set from the auth cookie).
export async function getGatedFeed(
  tier: Tier,
  opts: { source?: "auto" | "demo"; clientId?: string } = {},
): Promise<GatedFeed> {
  const { source = "auto", clientId } = opts;

  if (source === "auto" && hasSupabaseEnv) {
    const { client, signals, currentPeriod } = await fetchLiveFeed(clientId);
    const subscription: Subscription = {
      ...TIER_PRESETS[tier],
      current_period: currentPeriod,
    };
    return gate(client, signals, subscription);
  }

  const data = sample as unknown as {
    client: Client;
    subscription: Subscription;
    signals: Signal[];
  };
  const subscription: Subscription = {
    ...TIER_PRESETS[tier],
    current_period: data.subscription.current_period,
  };
  return gate(data.client, data.signals, subscription);
}
