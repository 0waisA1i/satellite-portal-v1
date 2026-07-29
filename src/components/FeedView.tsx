import type { CSSProperties } from "react";
import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import type { GatedFeed, Tier } from "@/lib/types";
import DemoBar from "@/components/DemoBar";
import ExportCsvButton from "@/components/ExportCsvButton";
import FeedClient from "@/components/FeedClient";
import TopBar from "@/components/TopBar";
import { ACCENT_HEX, formatPeriod } from "@/lib/archetypes";
import { getClientConfig } from "@/lib/constants";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function CtglLogo() {
  return (
    <svg viewBox="0 0 44 44" fill="none" className="h-[32px] w-[32px]">
      <g clipPath="url(#ctgl-c0)">
        <path d="M21.95 43.48C34.07 43.48 43.9 33.88 43.9 22.03 43.9 10.19 34.07.59 21.95.59 9.83.59.01 10.19.01 22.03.01 33.88 9.83 43.48 21.95 43.48Z" fill="#fff" />
        <path d="M32.16 12.82c2.04-1.33-24.78-2.25-19.95 15.95 1.55-3.27 4.16-4.98 6.2-7.24.36-.4-3.92 1.14-3.56.78 2.5-3.68 10.17-6.8 8.72-5.79-1.45 1.01-2.88 1.88-3.6 3.32-.65.77 3.55-.96 3.01-.36-3.45 1.91-6.79 7.68-7.42 12.43h1.4s8.12-.56 10.96-6.01c2.83-5.45 2.2-11.74 4.24-13.07Z" fill="#000" />
      </g>
      <defs>
        <clipPath id="ctgl-c0">
          <rect width="44" height="43" fill="#fff" transform="translate(0 .5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function H2oFooter() {
  const iconLinkCls =
    "flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] p-[9px] text-white/40 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white/80";
  return (
    <footer className="relative z-[1] bg-[#000000]">
      <div className="mx-auto max-w-[1180px] px-[26px]">
        <div className="h-px bg-white/[0.07]" />
        <div className="flex items-center justify-between gap-[24px] py-[28px] max-md:flex-col max-md:items-start">
          <div className="flex items-center gap-[12px]">
            <CtglLogo />
            <div>
              <div className="text-[15px] font-bold leading-tight tracking-[-0.01em]">
                CleanTech GrowthLab
              </div>
              <div className="mt-[2px] text-[10px] tracking-[0.06em] text-white/30">
                Satellite Client Portal
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-[12px] max-md:items-start">
            <div className="flex items-center gap-[8px]">
              <a
                href="https://www.linkedin.com/company/cleantech-growthlab"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={iconLinkCls}
              >
                <LinkedinIcon className="h-[14px] w-[14px]" />
              </a>
              <a
                href="https://cleantechgrowthlab.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className={iconLinkCls}
              >
                <Globe className="h-[14px] w-[14px]" />
              </a>
              <a
                href="mailto:eben@cleantechgrowthlab.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email"
                className={iconLinkCls}
              >
                <Mail className="h-[14px] w-[14px]" />
              </a>
            </div>
            <span className="text-[10px] tracking-[0.03em] text-white/25">
              Powered by Satellite · CleanTech GrowthLab
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

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
  const cfg = getClientConfig(client.id);
  const isH2o = cfg.isH2o;
  const usesTabView = cfg.usesTwoTabView;
  const isHistorical = view === "historical";
  const planTier = subscriptionTier ?? tier;

  return (
    <div
      className={`min-h-screen ${isH2o ? "flex flex-col" : ""}`}
      style={{ "--accent": ACCENT_HEX[client.accent] } as CSSProperties}
    >
      {isH2o && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(236,253,149,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 100px)",
            maskImage: "linear-gradient(to bottom, transparent 0px, black 100px)",
          } as CSSProperties}
        />
      )}
      <TopBar client={client} subscriptionTier={planTier} />
      {isH2o ? (
        // h2oallegiant: tier tabs (Feed/Stack/Command) + Historical link, no demo label
        <div className="relative z-[1] flex items-center justify-center border-b border-line bg-[#000000] px-[26px] py-[9px]">
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

      <div className={`mx-auto max-w-[1180px] px-[26px] pt-[30px] ${isH2o ? "pb-[32px] flex-1" : "pb-[90px]"}`}>
        <div className="mb-[8px] flex items-end justify-between gap-[24px] max-md:flex-col max-md:items-start">
          <div className="flex shrink-0 flex-col gap-[7px]">
            <span className="flex items-center gap-[10px] text-[10px] font-bold uppercase tracking-[0.18em] text-lime/70">
              Signal Satellite · {isH2o && isHistorical ? "Archived" : formatPeriod(subscription.current_period)}
              {isDemo && (
                <span className="rounded-full border border-line-2 bg-panel px-[8px] py-[2px] text-[8.5px] tracking-[0.12em] text-txt-3">
                  Demo data
                </span>
              )}
            </span>
            <h1 className="text-[34px] font-semibold leading-none tracking-[-0.025em]">
              This month&apos;s{" "}
              <em className="font-serif italic text-accent">{isH2o && isHistorical ? "worked signals" : "buying signals"}</em>
            </h1>
            <p className="max-w-[560px] text-[13.5px] leading-[1.5] text-txt-3">
              {isH2o && isHistorical
                ? "Signals you've actioned and moved to history. Each one represents an account you've engaged or deprioritised."
                : "Named accounts with live timing triggers, scored and surfaced for your segment. Each signal is one account, one reason to act now."}
            </p>
          </div>
          <div className="flex shrink-0 gap-[10px] max-md:w-full max-md:justify-between">
            <div className="min-w-[84px] min-h-[72px] rounded-[11px] border border-line bg-panel px-[16px] py-[11px] text-center">
              <span className="block text-[23px] font-bold leading-none tracking-[-0.02em]">
                {stats.total}
              </span>
              <span className="mt-[5px] block text-[7.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                Signals
              </span>
            </div>
            <div className="min-w-[84px] min-h-[72px] rounded-[11px] border border-line bg-panel px-[16px] py-[11px] text-center">
              <span className="block text-[23px] font-bold leading-none tracking-[-0.02em] text-accent">
                {stats.active}
              </span>
              <span className="mt-[5px] block text-[7.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                {isH2o && isHistorical ? "Archived" : "Active"}
              </span>
            </div>
            <div className="min-w-[84px] min-h-[72px] rounded-[11px] border border-line bg-panel px-[16px] py-[11px] text-center">
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
            {isHistorical
            ? (isH2o ? `Archived signals · ${signals.length}` : `Historical signals · ${signals.length}`)
            : `Surfaced this period · ${signals.length}`}
          </span>
          <span className="h-px flex-1 bg-line" />
          {!isHistorical && (
            <ExportCsvButton signals={signals} period={subscription.current_period} />
          )}
        </div>

        <FeedClient feed={feed} view={view} basePath={basePath} />
      </div>

      {isH2o && <H2oFooter />}
    </div>
  );
}
