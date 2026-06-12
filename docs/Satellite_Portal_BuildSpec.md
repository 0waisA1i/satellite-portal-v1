# Satellite Portal — Stage 8 "Surface" Build Spec

**For: Owais  From: Eben (via CGL Satellite)  Date: 2026-06-08**

This is the spec for the client-facing portal that surfaces the standardized signal data from your Stage 7 storage gate. It pairs with the working mockup: `Satellite_Portal_Mockup.html` (open it first — it is the visual contract). This doc covers what is missing in the data model, the schema, the tier-gating model, and the build/host path on the stack we already run.

The mockup is the source of truth for layout and interaction. This doc is the source of truth for data and architecture. Where my stage description does not match how you would build it, push back — same rule as the product spec.

---

## 1. What the portal is

A multi-tenant web app where a client logs in and sees their own signal feed for the current period. One client, one isolated view. The core surface is always the **Signal Feed**: up to 5 signal archetypes for the month, each tied to exactly one named account, laid out as cards with an expandable detail panel. Everything beyond the entitlement is blurred with an upgrade path.

Three subscription tiers gate what a client sees and does:

| | Signal Feed | Signal Stack | Signal Command |
|---|---|---|---|
| Signals visible | 5 / month | Unlimited | Unlimited |
| Segments | 1 | Up to 2 | Up to 4 |
| Decision-makers | Titles + angle | **Enriched named contacts** | Enriched named contacts |
| Outreach | — | **Generate script** | Generate script |
| Delivery | Digest + portal | Digest + portal | + Slack push, dedicated channel |
| CRM enrichment | — | Yes | Yes |

The gating is the product. Feed shows enough to prove the signals are real and tells the rep *who* (by title) and *the angle*, then blurs the rest. Stack turns titles into named, enriched contacts and one-click outreach. Command adds push delivery and more segments.

---

## 2. What is missing — close these before building

The current `signal_registry.json` per client (e.g. Kathairos, Get2C) is a strong Stage 7 artifact but it was built for the Excel/HTML brief, not a gated multi-tenant portal. Seven gaps:

1. **No entitlement model.** Nothing in the data says which tier a client is on, how many segments, or what the signal cap is. The portal cannot gate without this. → new `subscriptions` / entitlements table (Section 4).

2. **Account is free text, not an entity.** `company_or_operator` is a string. You flagged this yourself: one signal = one account, but Kathairos does not currently key it. The portal needs a real `accounts` row per signal so we can dedupe, group, enrich, and (later) sync to CRM. → normalize to an `accounts` table with a FK from `signals`.

3. **No distinct outreach angle field.** The Feed's core value is "here's the title to reach AND the angle." Today that lives blended inside `suggested_next_step`. Split it: `target_titles` (array) and `outreach_angle` (text) become first-class fields. The mockup shows them as separate UI elements.

4. **No contact slots.** Stage 9 enrichment is post-pilot, but the schema must accept 2–4 contacts per signal now (nullable) so we do not pay a migration later — exactly as your product spec already calls for. → `contacts` table, nullable, populated only for Stack+.

5. **No scan-period / curation flag.** The registry is cumulative and never deletes. The Feed is "the 5 we surfaced *this month*." We need a `surfaced_period` (e.g. `2026-06`) and a `surfaced` boolean (or a separate `feed_selections` table) so a human picks the 5 that go to a Feed-tier client. Without it the portal cannot answer "what's this month's feed."

6. **No auth / tenancy identity.** There is no notion of *who logs in* or how a login maps to a client. → Supabase Auth + a `client_id` claim, enforced by RLS (Section 5). This is the same DB-layer-not-app-layer isolation your product spec demands.

7. **No source-verification surface.** Stage 6 verifies source URLs; the portal should show a "verified" state. → a `source_verified` boolean on `signals`.

Two smaller visual gaps, fine to defer: per-client theming (logo + accent — mockup hardcodes one accent per client) and empty/loading states.

---

## 3. Recommended stack

All on tools we already run. Nothing new to procure.

- **Frontend + API:** Next.js (App Router) on **Vercel**. Server Components read Supabase directly; tier gating runs server-side so blurred data is *never sent to the client* (the mockup blurs in CSS — production must not ship locked rows at all).
- **Data + Auth:** **Supabase** (Postgres + Auth + Row-Level Security). This is the Stage 7 store. RLS is the multi-tenant isolation layer.
- **Repo + CI:** **GitHub** → Vercel auto-deploy. PR previews per branch.
- **Build agent:** **Claude Code** against the repo — scaffold, schema migrations, component build.
- **Enrichment / outreach (Stack+, post-pilot Stages 9–10):** server actions calling Apollo (enrich) and Claude (outreach copy). Keep behind a feature flag and the entitlement check.

Why not ship the static HTML brief as the portal: the brief is a per-scan snapshot (Step 9). The portal is a live, authenticated, gated, multi-client surface. Different job. The brief stays as the leave-behind; the portal becomes the system.

---

## 4. Schema (Supabase / Postgres)

Minimum tables. `signals` maps almost 1:1 from `signal_registry.json`; the rest are the gap-closers.

```sql
-- tenants
clients (
  id uuid pk, name text, code text,           -- "Kathairos","KAT"
  domain text, accent text default 'lime',     -- per-client theming
  logo_url text, created_at timestamptz
)

-- entitlement (gap #1)
subscriptions (
  id uuid pk, client_id uuid fk -> clients,
  tier text check (tier in ('feed','stack','command')),
  segment_limit int, signal_cap int,           -- feed=5, stack/command=null(unlimited)
  enrich_enabled bool, outreach_enabled bool, slack_enabled bool,
  status text, current_period text             -- '2026-06'
)

-- account entity (gap #2)
accounts (
  id uuid pk, client_id uuid fk -> clients,
  name text, sector text, geo text,
  crm_id text,                                 -- null until CRM sync
  unique (client_id, name)
)

-- the standardized signal model (Stage 7) — one account per signal
signals (
  id uuid pk,
  signal_id text,                              -- "KAT-001"
  client_id uuid fk -> clients,
  account_id uuid fk -> accounts,              -- the 1:1 link (gap #2)
  archetype text, archetype_tier text,         -- Gold/Silver/Bronze
  title text, summary text, signal_intelligence text,
  source_url text, source_verified bool,       -- gap #7
  trigger_label text, why_now text,
  target_titles text[],                        -- gap #3
  outreach_angle text,                         -- gap #3
  suggested_next_step text,
  rank_boost_flags text[],
  false_positive_filter text,
  confidence_initial int, confidence_current int,
  decay_rate_pts_per_week int,
  status text check (status in ('active','stale','expired')),
  est_volume text,
  first_seen date, last_seen date, scan_count int,
  surfaced_period text,                        -- gap #5  '2026-06'
  surfaced bool default false,                 -- gap #5  human-picked for Feed
  created_at timestamptz
)

-- contacts (gap #4) — nullable, Stack+ only, Stage 9 hook
contacts (
  id uuid pk, signal_id uuid fk -> signals, account_id uuid fk -> accounts,
  name text, title text, email text, linkedin_url text,
  enriched_at timestamptz, source text          -- 'apollo'
)
```

**Field mapping from `signal_registry.json`:** almost everything maps directly (`signal_id`, `archetype`, `archetype_tier`, `title`, `summary`, `source_url`, `company_or_operator`→`accounts.name`, `first_seen`, `last_seen`, `scan_count`, `initial_confidence`→`confidence_initial`, `current_confidence`→`confidence_current`, `decay_rate_pts_per_week`, `status`, `target_persona`→split into `target_titles` + `outreach_angle`, `suggested_next_step`, `rank_boost_flags`, `notes`). The new fields (`surfaced`, `surfaced_period`, `source_verified`, `account_id`) are the ones to populate during ingestion.

---

## 5. Tier gating — enforce server-side

The mockup demonstrates gating in the browser (CSS blur). **Production must gate in the query**, not the UI. A Feed-tier client's locked signals should never leave the database.

```
1. Auth: Supabase magic-link. JWT carries client_id.
2. RLS on every table: USING (client_id = auth.jwt()->>'client_id').
   This is the isolation layer — application filters will eventually leak; DB enforcement will not.
3. Feed query (server): signals WHERE client_id = $me
     AND surfaced = true AND surfaced_period = current_period
     ORDER BY confidence_current DESC
     LIMIT subscription.signal_cap   -- 5 for feed, none for stack/command
4. The "N more locked" count is a COUNT(*) only — the portal shows the number and the
   upgrade CTA, never the locked rows' content.
5. Contacts table: only joined when subscription.enrich_enabled. Feed clients get
   target_titles + outreach_angle (already on signals); never the contacts rows.
6. Outreach + Slack: server actions guarded by subscription.outreach_enabled / slack_enabled.
```

---

## 6. Build sequence (suggested milestones)

1. **M1 — read-only Feed.** Schema + RLS + auth. Seed Kathairos from its registry. Next.js Feed page rendering surfaced signals with the detail sheet. No enrichment. Ship to Vercel. This is the mockup, live, for one client.
2. **M2 — gating + multi-client.** Subscriptions table driving cap/blur/upgrade. Second client (Get2C) seeded. Client switch via login, not a dropdown. Confirm zero cross-tenant leakage.
3. **M3 — Stack actions.** `contacts` table + Apollo enrich behind `enrich_enabled`. Claude outreach generation behind `outreach_enabled`. CRM push stub.
4. **M4 — Command.** Slack push, segments, custom sources, per-client theming.

Ingestion stays your Stage 5–7 pipeline; the portal only reads. The one new pipeline responsibility is setting `surfaced` / `surfaced_period` — that is the human curation step where a strategist picks the month's 5 for Feed clients.

---

## 7. Open decisions for your judgment

- Magic-link vs SSO for client login (magic-link is fine for pilot).
- Whether `surfaced` selection is a portal admin UI or stays in Cowork/Claude for now (lean: keep in Cowork at M1, build admin UI at M4).
- Server Components reading Supabase directly vs a thin API layer (direct is simpler; API layer if you want non-web consumers later).
- Where outreach guardrails live (per-client messaging rules) — schema slot now, content later.

The mockup is the visual contract; this schema is the data contract. Build the stage boundaries clean and Feed→Stack→Command becomes a config change, not a rebuild — same principle as the rest of Satellite.
