# Live schema vs portal needs: gaps for Owais

**From: Eben (via CGL Satellite)  Date: 2026-06-13**

I introspected the live Supabase project (`vrxgpqezcfoqvdvtrtau`, `public` schema) and wired the Feed page to read from it. This is what's there, what maps cleanly, and what's missing before the portal can do tier gating and enrichment the way the build spec describes. Pairs with `Satellite_Portal_BuildSpec.md` (Section 2 gaps) and the generated `src/lib/database.types.ts`.

## What's live today

Four objects exposed in `public`:

| Object | Type | Rows | Role |
|---|---|---|---|
| `signals` | table | 14 | the core record (all 14 belong to client `kathairos`) |
| `icp_configs` | table | 1 | client ICP blob (sectors, geos, personas, archetypes) as `jsonb` |
| `scan_runs` | table | 7 | pipeline run log (Stage 7 internal) |
| `approach_windows` | view | 14 | derived urgency fields computed off `signals` |

RLS is on: the anon/publishable key returns 0 rows, so nothing leaks to an unauthenticated browser. We read on the server with the service-role key for now.

## What maps cleanly (live `signals` to the portal)

These render today with light transforms:

| Live column | Portal field | Note |
|---|---|---|
| `signal_id` | `signal_id` | direct |
| `archetype` (`A1`..`A4`) | `archetype` | resolved to human label via `icp_configs.config.archetypes` |
| `archetype_tier`, `priority_tier` | shown as the trigger chip | see gap on `trigger_label` |
| `company` | `account.name` | free text, not an entity (gap 2) |
| `title`, `summary` | `title`, `summary` | sanitized for encoding (see data-quality note) |
| `target_persona` | `target_titles[]` | parsed from the blended `"Primary: ... | Secondary: ..."` string |
| `next_step` | `suggested_next_step` | direct |
| `boost_flags` | `rank_boost_flags` | direct |
| `current_confidence` | `confidence_current` | drives the strength bar and sort order |
| `status` | `status` | direct |
| `approach_windows.days_until_stale` | `act_within_days` | from the view |
| `approach_windows.optimal_outreach_date` | `deadline_date` (proxy) | see gap on `deadline_date` |

## Gaps that block the product

These are the spec fields with no live column. Ordered by what they block.

### Blocks tier gating (the business model)

1. **No entitlements / `subscriptions` table.** The product is one "Signal Satellite" view for every plan: the plan gates which feature actions unlock (enrich, outreach, CRM), not how many signals are visible. But nothing in the DB says which tier a client is on, their feature flags, or segment count. The only live hint is `icp_configs.config.tier` (currently the string `"Signal Feed"`), buried in jsonb. The portal currently fakes the plan with a demo toggle. **Need a real `subscriptions` (or `clients` + entitlements) table** so feature gating reads from data, not a toggle. (Spec gap 1.)

2. **No `surfaced` / `surfaced_period` on `signals`.** The Feed is "the 5 we picked this month," but there's no flag for human curation and no period column. We currently treat every active signal as surfaced in the current period, which is wrong for a real Feed-tier client. **Need both columns** (or a `feed_selections` table). (Spec gap 5.)

### Blocks Stack+ features

3. **No `contacts` table.** Enriched named contacts (Stack+) have nowhere to read from. We return an empty contact set and the enrich action is stubbed. **Need the nullable `contacts` table** from the spec so we don't pay a migration later. (Spec gap 4.)

4. **No `outreach_angle`.** The Feed's core value is "here's the title to reach AND the angle." Today only the titles exist (parsed from `target_persona`); the angle is blank. **Need a first-class `outreach_angle` text field** (split it out of `next_step` / `target_persona` at ingestion). (Spec gap 3.)

### Degrades the Feed card (renders, but with fallbacks)

5. **No `accounts` entity.** `company` is free text, so no sector/geo per signal (the live sectors/geos exist only at the ICP level, not per account). The card's "sector | geo" line is empty. **Normalize to an `accounts` table** with a FK from `signals`. (Spec gap 2.)

6. **No `trigger_label`, `why_now`, `signal_intelligence`.** We derive: trigger chip = `archetype_tier · priority_tier`, why-now = first sentence of `summary`, detail body = `summary`. Fine for now, but these are distinct fields in the mockup.

7. **No `deadline_date` or `est_volume`.** "Deadline" uses `approach_windows.optimal_outreach_date` as a proxy (it's an outreach date, not a compliance deadline); "30-day volume" is blank. **Need a real `deadline_date`** and a volume field if we want that stat chip populated.

8. **No `source_verified`.** The "verified source" badge never shows. **Need a `source_verified` boolean** on `signals`. (Spec gap 7.)

### Auth / tenancy (verify before multi-client)

9. **`client_id` is free text** (`"kathairos"`), not a uuid FK, and there's no `clients` table or auth mapping. RLS blocks anon reads, but I could not verify tenant isolation across two clients because only one is seeded and there's no login-to-client mapping yet. **Confirm how a Supabase Auth login maps to `client_id`** (JWT claim) and seed a second client so we can prove zero cross-tenant leakage. (Spec gap 6.)

## Data-quality note

Several `signals.title` and `summary` values are mojibake-encoded (UTF-8 read as Latin-1), e.g. `Grand Banks Energy â€" NM Methane...` where an em dash belongs. The portal repairs the common sequences at render time, and converts em dashes to a plain hyphen because our copy rule bans em dashes. Better to fix this at ingestion in Stage 7 so the stored data is clean.

## What I'd prioritize

For a real gated Feed for one client: **gaps 1 and 2** (entitlements + surfaced flag). For Stack: **gaps 3 and 4** (contacts + outreach_angle). Everything else degrades gracefully and can land incrementally.
