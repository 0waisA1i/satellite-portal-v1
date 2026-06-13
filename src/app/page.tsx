import FeedView from "@/components/FeedView";
import { getGatedFeed, isTier } from "@/lib/feed";

// Live feed: reads Supabase when env is configured, falls back to sample data
// otherwise. The /demo route always shows sample data, even with live env set.
export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const params = await searchParams;
  const tier = isTier(params.tier) ? params.tier : "command";

  const feed = await getGatedFeed(tier);
  return <FeedView feed={feed} tier={tier} basePath="/" />;
}
