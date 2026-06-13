import FeedView from "@/components/FeedView";
import { getGatedFeed, isTier } from "@/lib/feed";

// Demo feed: always renders the bundled sample data, regardless of whether
// Supabase env is configured. This keeps a stable, DB-free showcase URL
// (/demo) available on the same Vercel deployment as the live app at "/".
export default async function DemoFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const params = await searchParams;
  const tier = isTier(params.tier) ? params.tier : "command";

  const feed = await getGatedFeed(tier, { source: "demo" });
  return <FeedView feed={feed} tier={tier} basePath="/demo" isDemo />;
}
