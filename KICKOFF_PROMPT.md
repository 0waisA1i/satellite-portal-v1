# Kickoff prompt

Paste this as your first message to Claude Code once you are inside the repo folder. It assumes `CLAUDE.md` and `docs/` are present.

---

Read `CLAUDE.md` in full, then read everything in `docs/` (the mockup, the build spec, and the sample signals JSON). Confirm back to me, in a short list, your understanding of: what we are building, the three-tier gating model, the server-side gating rule, and the visual contract.

Then propose a build plan in this order before writing code:
1. Scaffold a Next.js (App Router) + TypeScript + Tailwind project in this folder.
2. Translate the mockup's brand tokens (colors, fonts, the card and rail structure) into the Tailwind theme and a small set of React components: SignalCard, ArchetypeRail, StrengthBar, ActPill, DetailSheet, LockedCard, UpgradeBanner.
3. Build the Feed page against `docs/sample_signals.json` first, so we can see it running locally before any database is connected. Match the mockup closely.
4. Wire Supabase last: read the live schema (do not assume it matches the spec), generate types, map fields, and flag any missing columns as a list for Owais.

Do not connect to the database yet. Do not write the whole app in one shot. Scaffold first, show me the Feed page running against the sample JSON, and we will iterate from there.

When you are ready, start with step 1.

---

## Notes for you (Eben), not part of the prompt

- After it scaffolds, run `npm run dev` and open the local URL it gives you to see progress.
- Iterate in small asks: "make the strength bar match the mockup exactly," "add the detail slide-over," "now add the locked-card blur and upgrade banner."
- Only ask it to wire Supabase once Owais has given you the keys and confirmed the schema (see SETUP.md).
