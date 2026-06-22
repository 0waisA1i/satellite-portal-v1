import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FeedView from "@/components/FeedView";
import { getGatedFeed, isTier } from "@/lib/feed";

// Live feed: reads Supabase for the logged-in client.
// Auth is enforced by middleware (redirects to /login if no satellite_client_id cookie).
// The cookie is set by the login server action after verifying credentials + user_clients lookup.
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const [params, cookieStore] = await Promise.all([
    searchParams,
    cookies(),
  ]);

  const clientId = cookieStore.get("satellite_client_id")?.value;
  if (!clientId) redirect("/login");

  const tier = isTier(params.tier) ? params.tier : "command";
  const feed = await getGatedFeed(tier, { clientId });

  return <FeedView feed={feed} tier={tier} basePath="/" />;
}
