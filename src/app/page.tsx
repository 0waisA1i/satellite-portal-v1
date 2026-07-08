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

  // Real subscription tier from DB — used for TopBar badge on all clients.
  // h2oallegiant also uses it for gating; other clients use the demo URL toggle.
  const subscriptionTier = await fetchClientTier(clientId);
  const tier = isH2o
    ? subscriptionTier
    : (isTier(params.tier) ? params.tier : "command");

  const isHistorical = params.view === "historical" && isH2o;

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
