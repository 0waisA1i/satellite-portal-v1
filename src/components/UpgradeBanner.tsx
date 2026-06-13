import type { Tier } from "@/lib/types";
import { btnAccent } from "./SignalCard";

function Feat({ children, locked }: { children: string; locked?: boolean }) {
  return (
    <span
      className={`rounded-full border border-line bg-white/5 px-[10px] py-[4px] text-[10px] font-semibold ${locked ? "text-txt-4" : "text-txt-2"}`}
    >
      {locked ? "🔒 " : "✓ "}
      {children}
    </span>
  );
}

// Single view, so the upsell is about FEATURE unlocks, not signal counts.
export default function UpgradeBanner({
  tier,
  onUpgrade,
}: {
  tier: Tier;
  onUpgrade: (to: Tier) => void;
}) {
  return (
    <div className="mt-[22px] flex flex-wrap items-center gap-[22px] rounded-[14px] border border-lime/20 bg-gradient-to-br from-lime/5 to-cyan/5 p-[24px] py-[22px]">
      {tier === "command" && (
        <div className="min-w-[240px] flex-1">
          <div className="text-[17px] font-semibold tracking-[-0.01em]">
            You&apos;re on{" "}
            <em className="font-serif italic text-accent">Signal Command</em>:
            every feature is unlocked
          </div>
          <div className="mt-[6px] text-[12.5px] leading-[1.5] text-txt-2">
            Reveal enriched named contacts, generate trigger-specific outreach,
            and push signals straight to your CRM, across up to 4 segments.
          </div>
          <div className="mt-[12px] flex flex-wrap gap-[8px]">
            <Feat>Find &amp; enrich contacts</Feat>
            <Feat>Generate outreach</Feat>
            <Feat>Push to CRM</Feat>
            <Feat>Up to 4 segments</Feat>
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
              Push qualified signals straight to your CRM as tasks, and add up
              to 4 segments.
            </div>
            <div className="mt-[12px] flex flex-wrap gap-[8px]">
              <Feat>Find &amp; enrich contacts</Feat>
              <Feat>Generate outreach</Feat>
              <Feat locked>Push to CRM</Feat>
              <Feat locked>Up to 4 segments</Feat>
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
            </div>
            <div className="mt-[6px] text-[12.5px] leading-[1.5] text-txt-2">
              You see every surfaced signal with its target titles and angle.
              Signal Stack reveals the named decision-makers and generates
              trigger-specific outreach in one click.
            </div>
            <div className="mt-[12px] flex flex-wrap gap-[8px]">
              <Feat>All surfaced signals</Feat>
              <Feat locked>Find &amp; enrich contacts</Feat>
              <Feat locked>Generate outreach</Feat>
              <Feat locked>Push to CRM</Feat>
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
