import type { CSSProperties } from "react";
import DemoBar from "@/components/DemoBar";
import FeedClient from "@/components/FeedClient";
import TopBar from "@/components/TopBar";
import { ACCENT_HEX, formatPeriod } from "@/lib/archetypes";
import { getGatedFeed, isTier } from "@/lib/feed";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; cap?: string }>;
}) {
  const params = await searchParams;
  const tier = isTier(params.tier) ? params.tier : "feed";
  // Demo-only cap override (?cap=2) to preview the locked state while the
  // sample set is smaller than the Feed cap of 5.
  const cap = params.cap ? Number(params.cap) || undefined : undefined;

  const feed = getGatedFeed(tier, cap);
  const { client, subscription, signals, lockedCount, stats } = feed;

  return (
    <div
      className="min-h-screen"
      style={{ "--accent": ACCENT_HEX[client.accent] } as CSSProperties}
    >
      <TopBar client={client} tier={tier} />
      <DemoBar tier={tier} />

      <div className="mx-auto max-w-[1180px] px-[26px] pb-[90px] pt-[30px]">
        <div className="mb-[8px] flex items-end justify-between gap-[24px] max-md:flex-col max-md:items-start">
          <div className="flex flex-col gap-[7px]">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime/70">
              Signal Feed · {formatPeriod(subscription.current_period)}
            </span>
            <h1 className="text-[34px] font-semibold leading-none tracking-[-0.025em]">
              This month&apos;s{" "}
              <em className="font-serif italic text-accent">buying signals</em>
            </h1>
            <p className="max-w-[560px] text-[13.5px] leading-[1.5] text-txt-3">
              Named accounts with live timing triggers, scored and surfaced for
              your segment. Each signal is one account, one reason to act now.
            </p>
          </div>
          <div className="flex gap-[10px] max-md:w-full max-md:justify-between">
            <div className="min-w-[84px] rounded-[11px] border border-line bg-panel px-[16px] py-[11px] text-center">
              <span className="block text-[23px] font-bold leading-none tracking-[-0.02em]">
                {stats.total}
              </span>
              <span className="mt-[5px] block text-[7.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                Signals
              </span>
            </div>
            <div className="min-w-[84px] rounded-[11px] border border-line bg-panel px-[16px] py-[11px] text-center">
              <span className="block text-[23px] font-bold leading-none tracking-[-0.02em] text-accent">
                {stats.active}
              </span>
              <span className="mt-[5px] block text-[7.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                Active
              </span>
            </div>
            <div className="min-w-[84px] rounded-[11px] border border-line bg-panel px-[16px] py-[11px] text-center">
              <span className="block text-[23px] font-bold leading-none tracking-[-0.02em]">
                <em className="font-serif text-[19px] italic text-accent">
                  {stats.avgConfidence}
                </em>
              </span>
              <span className="mt-[5px] block text-[7.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                Avg conf
              </span>
            </div>
          </div>
        </div>

        <div className="mb-[16px] mt-[24px] flex items-center gap-[10px]">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-txt-3">
            {subscription.tier === "feed"
              ? `Surfaced this period · ${signals.length} of ${signals.length + lockedCount}`
              : `All signals · ${signals.length}`}
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <FeedClient feed={feed} />
      </div>
    </div>
  );
}
