import type { Tier } from "@/lib/types";
import { btnAccent } from "./SignalCard";

function Feat({ children, locked }: { children: string; locked?: boolean }) {
  return (
    <span
      className={`rounded-full border border-line bg-white/5 px-[10px] py-[4px] text-[10px] font-semibold ${locked ? "text-txt-4" : "text-txt-2"}`}
    >
      {locked ? "🔒 " : ""}
      {children}
    </span>
  );
}

export default function UpgradeBanner({
  tier,
  lockedCount,
  onUpgrade,
}: {
  tier: Tier;
  lockedCount: number;
  onUpgrade: (to: Tier) => void;
}) {
  return (
    <div className="mt-[22px] flex flex-wrap items-center gap-[22px] rounded-[14px] border border-lime/20 bg-gradient-to-br from-lime/5 to-cyan/5 p-[24px] py-[22px]">
      {tier === "command" && (
        <div className="min-w-[240px] flex-1">
          <div className="text-[17px] font-semibold tracking-[-0.01em]">
            You&apos;re on{" "}
            <em className="font-serif italic text-accent">Signal Command</em>:
            everything is unlocked
          </div>
          <div className="mt-[6px] text-[12.5px] leading-[1.5] text-txt-2">
            Unlimited signals across up to 4 segments, enriched contacts,
            generated outreach, plus Slack push and a dedicated channel.
          </div>
          <div className="mt-[12px] flex flex-wrap gap-[8px]">
            <Feat>Up to 4 segments</Feat>
            <Feat>Slack push</Feat>
            <Feat>CRM enrichment</Feat>
            <Feat>Custom sources</Feat>
            <Feat>Bi-weekly review</Feat>
          </div>
        </div>
      )}
      {tier === "stack" && (
        <>
          <div className="min-w-[240px] flex-1">
            <div className="text-[17px] font-semibold tracking-[-0.01em]">
              Unlock{" "}
              <em className="font-serif italic text-accent">Signal Command</em>
            </div>
            <div className="mt-[6px] text-[12.5px] leading-[1.5] text-txt-2">
              Push qualified signals straight to a dedicated Slack channel the
              moment they clear threshold, add up to 4 segments, and bring your
              own custom sources.
            </div>
            <div className="mt-[12px] flex flex-wrap gap-[8px]">
              <Feat>Enriched contacts ✓</Feat>
              <Feat>Generated outreach ✓</Feat>
              <Feat locked>Slack push</Feat>
              <Feat locked>Up to 4 segments</Feat>
              <Feat locked>Custom sources</Feat>
            </div>
          </div>
          <div className="ml-auto">
            <button className={btnAccent} onClick={() => onUpgrade("command")}>
              See Signal Command →
            </button>
          </div>
        </>
      )}
      {tier === "feed" && (
        <>
          <div className="min-w-[240px] flex-1">
            <div className="text-[17px] font-semibold tracking-[-0.01em]">
              Unlock{" "}
              <em className="font-serif italic text-accent">Signal Stack</em>
              {lockedCount > 0 &&
                `: ${lockedCount} more signal${lockedCount !== 1 ? "s" : ""} waiting`}
            </div>
            <div className="mt-[6px] text-[12.5px] leading-[1.5] text-txt-2">
              Signal Feed gives you 5 archetypes a month with target titles and
              the angle. Signal Stack unlocks every confirmed signal, finds and
              enriches the named decision-makers, and generates
              trigger-specific outreach in one click.
            </div>
            <div className="mt-[12px] flex flex-wrap gap-[8px]">
              <Feat>Target titles + angle ✓</Feat>
              <Feat locked>Unlimited signals</Feat>
              <Feat locked>Find &amp; enrich contacts</Feat>
              <Feat locked>Generate outreach</Feat>
              <Feat locked>CRM enrichment</Feat>
            </div>
          </div>
          <div className="ml-auto">
            <button className={btnAccent} onClick={() => onUpgrade("stack")}>
              Upgrade to Signal Stack →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
