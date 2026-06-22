# Satellite Portal

Client-facing web app for CleanTech GrowthLab's Satellite product. Reads scored buying signals from Supabase and presents them as a gated, multi-tenant portal. This is Stage 8 (Surface) — it does not run the signal pipeline, only reads from it.

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
git clone <repo-url>
cd satellite-portal
npm install
cp .env.example .env.local
```

Edit `.env.local` and fill in the three keys (get values from Owais):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key — server-only, never expose to the browser |

Use a dev/staging Supabase project, not production.

## Run locally

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Data source | Notes |
|---|---|---|
| `/demo` | Bundled sample data (`docs/sample_signals.json`) | Always works without env vars. Safe for client demos. |
| `/` | Live Supabase | Falls back to sample data if env vars are not set. |

Both routes accept a `?tier=feed|stack|command` query param to switch the active plan. In production the tier comes from the authenticated client's subscription row.

## Tier gating

Gating runs server-side in `src/lib/feed.ts`. The plan controls signal visibility (Feed: 5, Stack: 15, Command: all) and which feature actions are unlocked (enrich contacts, generate outreach, push to CRM). Contact PII never leaves the server until a contact is enriched and the plan permits it.

## Stack

Next.js (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase

## Project context

- Visual contract: `docs/Satellite_Portal_Mockup.html`
- Data contract: `docs/Satellite_Portal_BuildSpec.md`
- Full product brief: `CLAUDE.md`
