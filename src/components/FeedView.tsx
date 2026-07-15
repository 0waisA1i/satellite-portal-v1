import type { CSSProperties } from "react";
import Link from "next/link";
import type { GatedFeed, Tier } from "@/lib/types";
import DemoBar from "@/components/DemoBar";
import ExportCsvButton from "@/components/ExportCsvButton";
import FeedClient from "@/components/FeedClient";
import TopBar from "@/components/TopBar";
import { ACCENT_HEX, formatPeriod } from "@/lib/archetypes";

// Shared Signal Satellite layout rendered by both routes: the live feed at "/"
// and the always-sample feed at "/demo". `basePath` keeps the demo controls and
// upgrade links on the active route; `isDemo` surfaces a small badge so a
// sample-data view is never mistaken for live client data.
export default function FeedView({
  feed,
  tier,
  subscriptionTier,
  view = "feed",
  basePath,
  isDemo = false,
}: {
  feed: GatedFeed;
  tier: Tier;
  subscriptionTier?: Tier; // real DB tier; falls back to tier (e.g. on /demo)
  view?: "feed" | "historical";
  basePath: string;
  isDemo?: boolean;
}) {
  const { client, subscription, signals, stats } = feed;
  const isH2o = client.id === "h2oallegiant";
  const usesTabView =
    client.id === "gridvest" ||
    client.id === "cleantechgrowthlab" ||
    client.id === "ensights";
  const isHistorical = view === "historical";
  const planTier = subscriptionTier ?? tier;

  return (
    <div
      className="min-h-screen"
      style={{ "--accent": ACCENT_HEX[client.accent] } as CSSProperties}
    >
      <TopBar client={client} subscriptionTier={planTier} />
      {isH2o ? (
        // h2oallegiant: tier tabs (Feed/Stack/Command) + Historical link, no demo label
        <div className="flex items-center justify-center border-b border-line bg-white/[0.02] px-[26px] py-[9px]">
          <div className="flex gap-[2px] rounded-[10px] border border-line bg-panel p-[3px]">
            {(["feed", "stack", "command"] as const).map((t) => (
              <Link
                key={t}
                href={`${basePath}?tier=${t}`}
                className={`rounded-[7px] px-[16px] py-[6px] text-[12px] font-semibold capitalize transition ${
                  !isHistorical && tier === t ? "bg-accent text-black" : "text-txt-3"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Link>
            ))}
            <span className="mx-[4px] self-center border-l border-line-2" style={{ height: 18 }} />
            <Link
              href={`${basePath}?view=historical`}
              className={`rounded-[7px] px-[16px] py-[6px] text-[12px] font-semibold transition ${
                isHistorical ? "bg-accent text-black" : "text-txt-3"
              }`}
            >
              Historical
            </Link>
          </div>
        </div>
      ) : usesTabView ? (
        <div className="flex items-center justify-center border-b border-line bg-white/[0.02] px-[26px] py-[9px]">
          <div className="flex gap-[2px] rounded-[10px] border border-line bg-panel p-[3px]">
            <Link
              href={basePath}
              className={`rounded-[7px] px-[16px] py-[6px] text-[12px] font-semibold transition ${!isHistorical ? "bg-accent text-black" : "text-txt-3"}`}
            >
              Active
            </Link>
            <Link
              href={`${basePath}?view=historical`}
              className={`rounded-[7px] px-[16px] py-[6px] text-[12px] font-semibold transition ${isHistorical ? "bg-accent text-black" : "text-txt-3"}`}
            >
              Historical
            </Link>
          </div>
        </div>
      ) : (
        <DemoBar tier={tier} basePath={basePath} />
      )}

      <div className="mx-auto max-w-[1180px] px-[26px] pb-[90px] pt-[30px]">
        <div className="mb-[8px] flex items-end justify-between gap-[24px] max-md:flex-col max-md:items-start">
          <div className="flex flex-col gap-[7px]">
            <span className="flex items-center gap-[10px] text-[10px] font-bold uppercase tracking-[0.18em] text-lime/70">
              Signal Satellite · {formatPeriod(subscription.current_period)}
              {isDemo && (
                <span className="rounded-full border border-line-2 bg-panel px-[8px] py-[2px] text-[8.5px] tracking-[0.12em] text-txt-3">
                  Demo data
                </span>
              )}
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
            {isHistorical ? `Historical signals · ${signals.length}` : `Surfaced this period · ${signals.length}`}
          </span>
          <span className="h-px flex-1 bg-line" />
          {!isHistorical && (
            <ExportCsvButton signals={signals} period={subscription.current_period} />
          )}
        </div>

        <FeedClient feed={feed} view={view} basePath={basePath} />
      </div>
    </div>
  );
}
