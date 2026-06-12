# Satellite Portal

The client-facing web app for Satellite, CleanTech GrowthLab's signal-scouting product (Stage 8: Surface). It reads scored buying signals from the Stage 7 Supabase store and presents them as a gated, multi-tenant portal.

Project context lives in `CLAUDE.md` (read first). The visual contract is `docs/Satellite_Portal_Mockup.html`; the data contract is `docs/Satellite_Portal_BuildSpec.md`.

## Current state

- Feed page built against `docs/sample_signals.json` (no database connected yet).
- Tier gating runs server-side from day one: locked signals and contact rows are filtered in the Server Component (`src/lib/feed.ts`) and never reach the browser. Locked content is a count plus an upgrade call to action.
- The "Preview tier" bar is a demo control while we run on sample data. Each toggle re-renders through the server gate via the URL (`?tier=feed|stack|command`). Add `&cap=2` to preview the locked-card state (the sample set is smaller than the Feed cap of 5).
- Outreach generation is a stub per the v1 definition of done.

## Run it

```
npm install
npm run dev
```

Open http://localhost:3000.

## Next steps

1. Connect Supabase (keys from Owais in `.env.local`, see `.env.example`): introspect the live schema, generate types, map fields, list gaps.
2. Supabase Auth + RLS for tenant isolation, replacing the demo tier toggle with the real subscription row.
3. Deploy to Vercel with env-based config.
