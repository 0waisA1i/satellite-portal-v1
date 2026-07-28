import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FeedView from "@/components/FeedView";
import { getGatedFeed, getHistoricalFeed, isTier } from "@/lib/feed";
import { fetchClientTier } from "@/lib/live";
import { getClientConfig } from "@/lib/constants";

// Live feed: reads Supabase for the logged-in client.
// Auth is enforced by proxy.ts (redirects to /login if no satellite_client_id cookie).
// The cookie is set by the login server action after verifying credentials + user_clients lookup.
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; view?: string }>;
}) {
  const [params, cookieStore] = await Promise.all([
    searchParams,
    cookies(),
  ]);

  const clientId = cookieStore.get("satellite_client_id")?.value;
  if (!clientId) redirect("/login");

  const cfg = getClientConfig(clientId);

  // Real subscription tier + cap from DB. Tab-view clients always use the DB
  // tier. h2oallegiant defaults to DB tier but the URL param overrides it
  // (tier tab links). Others use the demo URL toggle.
  const { tier: subscriptionTier, signal_cap } = await fetchClientTier(clientId);
  const tier = cfg.usesTwoTabView
    ? subscriptionTier
    : (isTier(params.tier) ? params.tier : subscriptionTier ?? "command");

  // Historical view: two-tab clients via ?view=historical, and h2oallegiant
  // which keeps the Historical link in its tier-tab nav.
  const isHistorical = params.view === "historical" && (cfg.usesTwoTabView || cfg.isH2o);

  const feed = isHistorical
    ? await getHistoricalFeed(tier, { clientId })
    : await getGatedFeed(tier, { clientId, signal_cap });

  return (
    <FeedView
      feed={feed}
      tier={tier}
      subscriptionTier={subscriptionTier}
      view={isHistorical ? "historical" : "feed"}
      basePath="/"
    />
  );
}
