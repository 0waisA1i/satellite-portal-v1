import "server-only";
import type {
  Contact,
  GatedFeed,
  Signal,
  Subscription,
  Tier,
  VisibleContact,
  VisibleSignal,
} from "./types";
import sample from "../../docs/sample_signals.json";

// Plan presets mirror the future `subscriptions` table (BuildSpec section 4).
// The product is now a single "Signal Satellite" view: every plan sees all
// surfaced signals, and the plan only decides which feature actions are
// unlocked. When Supabase is wired, the row for the logged-in client replaces
// this and the demo plan toggle goes away.
const TIER_PRESETS: Record<Tier, Omit<Subscription, "current_period">> = {
  feed: {
    tier: "feed",
    segment_limit: 1,
    enrich_enabled: false,
    outreach_enabled: false,
    crm_enabled: false,
  },
  stack: {
    tier: "stack",
    segment_limit: 2,
    enrich_enabled: true,
    outreach_enabled: true,
    crm_enabled: false,
  },
  command: {
    tier: "command",
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
// browser. Enrichment itself is a later version, so today this returns
// titles only on every plan.
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

export function getGatedFeed(tier: Tier): GatedFeed {
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

  const signals: VisibleSignal[] = qualified.map(({ contacts, ...rest }) => ({
    ...rest,
    contacts: contacts.map((c) => maskContact(c, subscription)),
  }));

  return {
    client: data.client,
    subscription,
    signals,
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
