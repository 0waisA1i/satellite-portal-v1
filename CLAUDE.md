# Satellite Client Portal

This file is read automatically by Claude Code at the start of every session. It is the single source of truth for what we are building. Read it fully, then read the files under `docs/` before writing any code.

## What this is

Satellite is CleanTech GrowthLab's signal-scouting product. A pipeline (owned by Owais) finds, scores, and stores high-confidence buying signals for cleantech clients in a Supabase database (this is "Stage 7" of the product). This project is "Stage 8: Surface": the client-facing web app that reads those stored signals and presents them as a gated, multi-tenant portal.

We are NOT building the pipeline. We only read from Supabase and render.

## The visual contract

`docs/Satellite_Portal_Mockup.html` is the approved high-fidelity mockup. Open it and match it. It is a self-contained HTML file with working interactions (tier toggle, client switch, detail slide-over, blur-to-upgrade, enrich and outreach panels). The production app should reproduce its layout, brand, and interaction model in Next.js + React. Treat its CSS tokens and component structure as the design system.

Key visual elements to reproduce:
- Signal cards with a left "archetype rail" (colored, groups signals by archetype), company name, sector, trigger chip, "why now" line.
- A "Signal strength" bar (the single merged confidence measure, 0 to 100) in the rail.
- A standardized "Act in X days" pill, color-shifting by urgency (<=30 days lime, <=60 mint, beyond cyan).
- A "Deadline" and "30-day volume" stat chip.
- A decision-maker block: target titles + outreach angle.
- A detail slide-over with the full signal record.
- Locked/blurred cards beyond the tier cap, with an upgrade call to action.

## Brand tokens (dark mode)

- Background `#000`. Fonts: `DM Sans` (body), `Instrument Serif` italic (accent numerals/headings).
- Accents: lime `#ECFD95`, mint `#CBF3BA`, cyan `#40E3FD`, grey `#C1C1C1`, alert red `#FF8585`.
- Each archetype gets a distinct accent. First Gold-tier = lime, second = mint, Silver channel = cyan, Silver monitoring = grey.

## The data model and tier gating

Full schema and rationale: `docs/Satellite_Portal_BuildSpec.md`. Read it before designing types.

Three subscription tiers gate what a client sees and does:

| | Signal Feed | Signal Stack | Signal Command |
|---|---|---|---|
| Signals visible | 5 / month | Unlimited | Unlimited |
| Segments | 1 | Up to 2 | Up to 4 |
| Decision-makers | Titles + angle only | Enriched named contacts | Enriched named contacts |
| Outreach | none | Generate script | Generate script |
| Delivery | Digest + portal | Digest + portal | + Slack push |
| CRM enrichment | none | Yes | Yes |

The gating is the product. Critical rule: **gate server-side, never client-side.** A Feed-tier client's locked signals and the `contacts` rows must never leave the database. The mockup blurs in CSS for demo purposes only; production must not send locked content to the browser. Show a count and an upgrade call to action instead.

`docs/sample_signals.json` is sample data in the standardized shape. Use it to build the UI before the live DB is connected. It contains no real client data.

## Stack

- Next.js (App Router) + React + TypeScript. Server Components read Supabase directly so gating runs on the server.
- Supabase (Postgres + Auth + Row-Level Security). RLS is the tenant-isolation layer, not application filters.
- `@supabase/supabase-js` for runtime data access via env vars.
- Tailwind CSS for styling (translate the mockup's tokens into Tailwind theme values).
- Deploy target: Vercel.

## Connecting to the real database

Owais owns the Supabase project. The schema in the spec is a proposal; **the live schema is the source of truth.** Before generating queries or types:
1. Introspect the actual tables and columns (use the Supabase MCP server if configured, or ask for the schema).
2. Generate TypeScript types from the live schema.
3. Map mockup fields to real columns. Where a field in the spec (for example `outreach_angle`, `surfaced`, `deadline_date`) does not yet exist in the live DB, list it as a gap for Owais rather than inventing it.

Use a development or staging Supabase project, never production, while iterating.

## Definition of done for v1

1. A logged-in client sees only their own signals (RLS enforced, verified with two test clients).
2. The Feed page renders surfaced signals for the current period, capped per the client's tier, matching the mockup.
3. Locked signals beyond the cap show a blurred placeholder + upgrade call to action, with no locked data sent to the client.
4. The detail slide-over shows the full signal record.
5. Titles + angle render on all tiers; enriched contacts and outreach generation are gated to Stack+ and stubbed if the backend is not ready.
6. Deploys to Vercel with env-based config.

## Conventions

- Never use em dashes in any user-facing copy or generated content. Use commas, colons, or parentheses.
- Peer-level, direct tone in all client-facing strings.
- Keep components small and typed. Co-locate the gating logic in server code, not in client components.
- When unsure about a data field, check the live schema before assuming.
