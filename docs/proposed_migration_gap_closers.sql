-- ============================================================================
-- PROPOSED migration: gap-closers for the Satellite Portal (Stage 8 "Surface")
-- For: Owais   From: Eben (via CGL Satellite)   Date: 2026-06-13
-- ============================================================================
--
-- This is a PROPOSAL for review, not an applied migration. Owais owns the
-- Supabase project and the live schema is the source of truth. Please review,
-- adjust to your conventions, and run on a DEV / STAGING project first.
--
-- Design choices (so this is non-breaking against what exists today):
--   * It is ADDITIVE and IDEMPOTENT (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
--     It does not drop or rewrite existing columns or data.
--   * It keys tenancy on the EXISTING `signals.client_id` text code
--     (e.g. 'kathairos'), not a new uuid, so current rows keep working. A
--     `clients` table provides that code as a stable key plus theming.
--     If you prefer full uuid normalization (per BuildSpec Section 4), that is
--     a larger migration; this is the minimal path to unblock the portal.
--   * Closes the gaps in docs/SCHEMA_GAPS_FOR_OWAIS.md: entitlements (#1),
--     surfaced flag (#2), contacts (#3), outreach_angle (#4), accounts (#5),
--     trigger/why-now/intelligence (#6), deadline/volume (#7),
--     source_verified (#8), and tenancy identity (#9 / RLS).
--
-- Maps to the portal's UI shape in src/lib/types.ts and the fallbacks currently
-- living in src/lib/live.ts. Once these land, those fallbacks can be removed.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 1. clients  (gap #9 tenancy identity + per-client theming)
--    `code` matches the existing signals.client_id values ('kathairos', ...).
-- ----------------------------------------------------------------------------
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,                 -- e.g. 'kathairos' (== signals.client_id)
  name        text not null,                        -- e.g. 'Kathairos Solutions'
  domain      text,
  accent      text not null default 'lime'          -- 'lime' | 'mint' | 'cyan' | 'grey'
                check (accent in ('lime','mint','cyan','grey')),
  logo_url    text,
  created_at  timestamptz default now()
);

-- Seed from the ICP configs already in the DB (one row per client).
insert into public.clients (code, name, domain)
select client_id, client_name, domain
from public.icp_configs
on conflict (code) do nothing;

-- ----------------------------------------------------------------------------
-- 2. subscriptions  (gap #1 entitlements: the gating data the portal needs)
--    Today the tier only lives implicitly in icp_configs.config.tier.
-- ----------------------------------------------------------------------------
-- The product is one "Signal Satellite" view for every plan: the plan gates
-- which FEATURE actions are unlocked (enrich, outreach, CRM), not how many
-- signals are visible. So there is no signal_cap; segment_limit still scopes
-- how many segments a client can configure.
create table if not exists public.subscriptions (
  id               uuid primary key default gen_random_uuid(),
  client_code      text not null references public.clients(code) on delete cascade,
  tier             text not null check (tier in ('feed','stack','command')),
  segment_limit    int  not null default 1,         -- feed=1, stack=2, command=4
  enrich_enabled   bool not null default false,     -- reveal named contacts
  outreach_enabled bool not null default false,     -- generate outreach
  crm_enabled      bool not null default false,     -- push to CRM
  status           text not null default 'active',
  current_period   text not null,                   -- '2026-06'
  created_at       timestamptz default now(),
  unique (client_code)
);

-- Seed the one known client at Feed tier (matches icp_configs.config.tier).
insert into public.subscriptions
  (client_code, tier, segment_limit, enrich_enabled, outreach_enabled, crm_enabled, current_period)
select code, 'feed', 1, false, false, false, to_char(now(), 'YYYY-MM')
from public.clients
on conflict (client_code) do nothing;

-- ----------------------------------------------------------------------------
-- 3. accounts  (gap #5: normalize signals.company into an entity)
-- ----------------------------------------------------------------------------
create table if not exists public.accounts (
  id           uuid primary key default gen_random_uuid(),
  client_code  text not null references public.clients(code) on delete cascade,
  name         text not null,
  sector       text,
  geo          text,
  crm_id       text,                                -- null until CRM sync
  created_at   timestamptz default now(),
  unique (client_code, name)
);

-- Backfill accounts from existing signals.company values.
insert into public.accounts (client_code, name)
select distinct client_id, company
from public.signals
where company is not null
on conflict (client_code, name) do nothing;

-- ----------------------------------------------------------------------------
-- 4. signals: additive columns the mockup renders (gaps #2, #4, #5, #6, #7, #8)
--    Existing columns (company, target_persona, next_step, boost_flags,
--    initial_confidence, current_confidence, decay_rate) are left untouched.
-- ----------------------------------------------------------------------------
alter table public.signals
  add column if not exists account_id          uuid references public.accounts(id),
  add column if not exists surfaced            boolean not null default false,  -- gap #2
  add column if not exists surfaced_period     text,                            -- gap #2  '2026-06'
  add column if not exists target_titles       text[],                          -- gap #4  (split from target_persona)
  add column if not exists outreach_angle      text,                            -- gap #4
  add column if not exists trigger_label       text,                            -- gap #6
  add column if not exists why_now             text,                            -- gap #6
  add column if not exists signal_intelligence text,                            -- gap #6
  add column if not exists deadline_date       date,                            -- gap #7
  add column if not exists est_volume          text,                            -- gap #7
  add column if not exists source_verified     boolean not null default false;  -- gap #8

-- Link signals to their backfilled account rows.
update public.signals s
set account_id = a.id
from public.accounts a
where a.client_code = s.client_id
  and a.name = s.company
  and s.account_id is null;

-- ----------------------------------------------------------------------------
-- 5. contacts  (gap #3: nullable, Stack+ only, Stage 9 enrichment hook)
-- ----------------------------------------------------------------------------
create table if not exists public.contacts (
  id           uuid primary key default gen_random_uuid(),
  signal_id    uuid not null references public.signals(id) on delete cascade,
  account_id   uuid references public.accounts(id),
  name         text,
  title        text,
  email        text,
  linkedin_url text,
  enriched_at  timestamptz,
  source       text                                  -- e.g. 'apollo'
);
create index if not exists contacts_signal_id_idx on public.contacts(signal_id);

-- ----------------------------------------------------------------------------
-- 6. Row-Level Security (gap #9: DB-layer tenant isolation, not app filters)
--    Assumes a Supabase Auth JWT carrying a `client_id` claim equal to the
--    client code. Adjust the claim path/name to however you mint client logins.
--    NOTE: the service-role key bypasses RLS; the portal's current server reads
--    use it. Move portal reads to a request-scoped anon client so these policies
--    actually enforce isolation.
-- ----------------------------------------------------------------------------
alter table public.clients       enable row level security;
alter table public.subscriptions enable row level security;
alter table public.accounts      enable row level security;
alter table public.signals       enable row level security;
alter table public.contacts      enable row level security;
alter table public.icp_configs   enable row level security;

-- Helper: the caller's client code from the JWT.
-- (auth.jwt() ->> 'client_id') returns the custom claim set at login.

drop policy if exists tenant_read_clients on public.clients;
create policy tenant_read_clients on public.clients
  for select using (code = (auth.jwt() ->> 'client_id'));

drop policy if exists tenant_read_subscriptions on public.subscriptions;
create policy tenant_read_subscriptions on public.subscriptions
  for select using (client_code = (auth.jwt() ->> 'client_id'));

drop policy if exists tenant_read_accounts on public.accounts;
create policy tenant_read_accounts on public.accounts
  for select using (client_code = (auth.jwt() ->> 'client_id'));

drop policy if exists tenant_read_signals on public.signals;
create policy tenant_read_signals on public.signals
  for select using (client_id = (auth.jwt() ->> 'client_id'));

-- Contacts isolate via their parent signal's client.
drop policy if exists tenant_read_contacts on public.contacts;
create policy tenant_read_contacts on public.contacts
  for select using (
    exists (
      select 1 from public.signals s
      where s.id = contacts.signal_id
        and s.client_id = (auth.jwt() ->> 'client_id')
    )
  );

drop policy if exists tenant_read_icp on public.icp_configs;
create policy tenant_read_icp on public.icp_configs
  for select using (client_id = (auth.jwt() ->> 'client_id'));

commit;

-- ============================================================================
-- After running, the portal can:
--   * read tier/feature flags from subscriptions instead of the demo toggle
--   * answer "this month's feed" via signals.surfaced + surfaced_period
--   * render sector/geo from accounts and the split target_titles/outreach_angle
--   * join contacts for Stack+ clients
--   * show the verified-source badge
-- Open items for Owais's judgment:
--   * Confirm the JWT claim name/path used for client_id.
--   * Decide whether `surfaced` is set in Cowork/Claude (M1) or a portal admin UI (M4).
--   * If you want uuid-normalized client_id on signals, that is a separate,
--     larger migration; this proposal keeps the existing text code to stay safe.
-- ============================================================================
