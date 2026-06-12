import "server-only";
import type {
  GatedFeed,
  Signal,
  Subscription,
  Tier,
  VisibleSignal,
} from "./types";
import sample from "../../docs/sample_signals.json";

// Tier presets mirror the future `subscriptions` table (BuildSpec section 4).
// When Supabase is wired, the row for the logged-in client replaces this and
// the demo tier toggle goes away.
const TIER_PRESETS: Record<Tier, Omit<Subscription, "current_period">> = {
  feed: {
    tier: "feed",
    segment_limit: 1,
    signal_cap: 5,
    enrich_enabled: false,
    outreach_enabled: false,
    slack_enabled: false,
  },
  stack: {
    tier: "stack",
    segment_limit: 2,
    signal_cap: null,
    enrich_enabled: true,
    outreach_enabled: true,
    slack_enabled: false,
  },
  command: {
    tier: "command",
    segment_limit: 4,
    signal_cap: null,
    enrich_enabled: true,
    outreach_enabled: true,
    slack_enabled: true,
  },
};

export const TIER_LABELS: Record<Tier, string> = {
  feed: "Signal Feed",
  stack: "Signal Stack",
  command: "Signal Command",
};

export function isTier(value: string | undefined): value is Tier {
  return value === "feed" || value === "stack" || value === "command";
}

// The critical rule: gating happens here, on the server, before anything is
// serialized to the browser. Locked signals are reduced to a count; contacts
// are stripped unless the subscription has enrich_enabled. When Supabase is
// wired, this becomes the gated query (LIMIT signal_cap + COUNT of the rest)
// and RLS handles tenant isolation.
export function getGatedFeed(tier: Tier, capOverride?: number): GatedFeed {
  const data = sample as unknown as {
    client: GatedFeed["client"];
    subscription: Subscription;
    signals: Signal[];
  };

  const subscription: Subscription = {
    ...TIER_PRESETS[tier],
    current_period: data.subscription.current_period,
  };

  const qualified = data.signals
    .filter(
      (s) =>
        s.surfaced &&
        s.surfaced_period === subscription.current_period &&
        s.status !== "expired",
    )
    .sort((a, b) => b.confidence_current - a.confidence_current);

  const cap = capOverride ?? subscription.signal_cap;
  const unlocked = cap === null ? qualified : qualified.slice(0, cap);

  const signals: VisibleSignal[] = unlocked.map(({ contacts, ...rest }) => ({
    ...rest,
    contacts: subscription.enrich_enabled ? contacts : null,
  }));

  return {
    client: data.client,
    subscription,
    signals,
    lockedCount: qualified.length - unlocked.length,
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
