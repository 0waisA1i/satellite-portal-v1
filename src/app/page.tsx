import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FeedView from "@/components/FeedView";
import { getGatedFeed, getHistoricalFeed, isTier } from "@/lib/feed";
import { fetchClientTier } from "@/lib/live";

// Live feed: reads Supabase for the logged-in client.
// Auth is enforced by middleware (redirects to /login if no satellite_client_id cookie).
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

  const isH2o = clientId === "h2oallegiant";

  // Clients that use the Active/Historical two-tab view. h2oallegiant is
  // excluded: it keeps Feed/Stack/Command tier tabs + a Historical link.
  const usesTwoTabView =
    clientId === "kathairos" ||
    clientId === "gridvest" ||
    clientId === "cleantechgrowthlab" ||
    clientId === "ensights";

  // Real subscription tier from DB — always fetched for the TopBar badge.
  // Tab-view clients gate by DB tier. h2oallegiant defaults to DB tier but
  // URL param overrides it (tier tab links). Others use the demo URL toggle.
  const subscriptionTier = await fetchClientTier(clientId);
  const tier = usesTwoTabView
    ? subscriptionTier
    : (isTier(params.tier) ? params.tier : subscriptionTier ?? "command");

  // Historical view: tab-view clients via ?view=historical, and h2oallegiant
  // which keeps the Historical link in its tier-tab nav.
  const isHistorical = params.view === "historical" && (usesTwoTabView || isH2o);

  const feed = isHistorical
    ? await getHistoricalFeed(tier, { clientId })
    : await getGatedFeed(tier, { clientId });

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
