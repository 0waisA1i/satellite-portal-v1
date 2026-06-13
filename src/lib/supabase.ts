import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Server-only Supabase client. Uses the service-role key, which bypasses RLS,
// so it must NEVER be imported into a client component. Gating is enforced in
// our query logic (src/lib/feed.ts), not by RLS, when this key is used.
//
// Once real auth + a client_id JWT claim exist, the read path should move to a
// request-scoped anon client so RLS does the tenant isolation. For now there is
// one seeded client and no auth, so we read with the service key on the server.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabaseEnv = Boolean(url && serviceKey);

export function getServerSupabase() {
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase env not set. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    );
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
