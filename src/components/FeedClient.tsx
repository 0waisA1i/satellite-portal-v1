"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GatedFeed, Subscription, Tier, VisibleSignal } from "@/lib/types";
import DetailSheet, { type SheetMode } from "./DetailSheet";
import SignalCard from "./SignalCard";
import UpgradeBanner from "./UpgradeBanner";
import { LockIcon } from "./icons";

// Realistic-looking placeholder signals used when real teasers run out (e.g.
// Stack tier where all signals fit within the cap). Shown blurred, so only the
// visual structure — company name, archetype rail color, confidence bar — needs
// to read as credible.
const PLACEHOLDER_SIGNALS: VisibleSignal[] = [
  {
    signal_id: "ph-0",
    archetype: "Regulatory Pressure",
    account: {
      name: "Apex Industrial Group",
      sector: "Heavy Manufacturing",
      geo: "Midwest, US",
    },
    title: "EPA Compliance Deadline Approaching",
    trigger_label: "Regulatory Deadline",
    why_now: "Q3 EPA compliance window closes in 47 days",
    summary: "",
    signal_intelligence: "",
    suggested_next_step: "",
    target_titles: ["VP Operations", "Chief Compliance Officer"],
    outreach_angle:
      "Compliance timeline creates urgency for procurement decisions this quarter.",
    false_positive_filter: "",
    rank_boost_flags: [],
    confidence_current: 81,
    deadline_date: "2026-08-15",
    act_within_days: 47,
    est_volume: "$2.4M",
    status: "active",
    source_url: "",
    source_verified: false,
    surfaced: true,
    surfaced_period: "2026-06",
    contacts: [],
  },
  {
    signal_id: "ph-1",
    archetype: "CapEx Cycle",
    account: {
      name: "Northgate Energy Partners",
      sector: "Utilities",
      geo: "Pacific Northwest, US",
    },
    title: "Grid Modernisation Procurement Round",
    trigger_label: "Capital Budget Open",
    why_now: "Annual CapEx window opens following board approval last week",
    summary: "",
    signal_intelligence: "",
    suggested_next_step: "",
    target_titles: ["Director of Infrastructure", "VP Engineering"],
    outreach_angle:
      "Capital allocation cycle aligns with solution deployment timeline.",
    false_positive_filter: "",
    rank_boost_flags: [],
    confidence_current: 74,
    deadline_date: "2026-09-01",
    act_within_days: 71,
    est_volume: "$1.8M",
    status: "active",
    source_url: "",
    source_verified: false,
    surfaced: true,
    surfaced_period: "2026-06",
    contacts: [],
  },
];

function LockedCard({
  signal,
  subscription,
}: {
  signal: VisibleSignal;
  subscription: Subscription;
}) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line/50">
      {/* Blurred signal content — higher brightness so archetype colors bleed through */}
      <div className="pointer-events-none select-none blur-[6px] brightness-[0.62]">
        <SignalCard
          signal={signal}
          subscription={subscription}
          onDetail={() => {}}
          onEnrich={() => {}}
          onOutreach={() => {}}
          onCrm={() => {}}
        />
      </div>

      {/* Lime left stripe overlay */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[5px] rounded-l-[14px] bg-lime/25" />

      {/* Bottom gradient fade to page background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-black to-transparent" />

      {/* Centered lock badge */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="flex flex-col items-center gap-[10px] rounded-[14px] border border-lime/40 bg-black/75 px-[28px] py-[20px] backdrop-blur-md"
          style={{
            boxShadow:
              "0 0 32px rgba(236,253,149,0.12), 0 0 0 1px rgba(236,253,149,0.08)",
          }}
        >
          <LockIcon className="h-[22px] w-[22px] text-lime" />
          <div className="flex flex-col items-center gap-[4px]">
            <span className="text-[11px] font-bold tracking-[0.08em] text-lime">
              Locked
            </span>
            <span className="text-[10px] font-medium tracking-[0.04em] text-lime/55">
              Upgrade to view more signals
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedClient({
  feed,
  basePath = "/",
}: {
  feed: GatedFeed;
  basePath?: string;
}) {
  const router = useRouter();
  const [sheet, setSheet] = useState<{
    signal: VisibleSignal;
    mode: SheetMode;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }, []);

  const upgrade = (to: Tier) => {
    router.push(`${basePath}?tier=${to}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { tier } = feed.subscription;

  // Always exactly 1 teaser card; fall back to a placeholder if real teasers
  // run out (e.g. Stack tier where all signals fit within the cap).
  const teaserSignal: VisibleSignal =
    feed.teaserSignals[0] ?? PLACEHOLDER_SIGNALS[0];

  return (
    <>
      <div className="flex flex-col gap-[14px]">
        {feed.signals.map((s) => (
          <SignalCard
            key={s.signal_id}
            signal={s}
            subscription={feed.subscription}
            onDetail={() => setSheet({ signal: s, mode: "detail" })}
            onEnrich={() => showToast("Enrichment runs in a later version")}
            onOutreach={() => setSheet({ signal: s, mode: "outreach" })}
            onCrm={() =>
              showToast(`Pushed "${s.account.name}" to your CRM as a task`)
            }
          />
        ))}
      </div>

      {tier !== "command" && (
        <>
          <div className="mt-[14px]">
            <LockedCard
              signal={teaserSignal}
              subscription={feed.subscription}
            />
          </div>
          <UpgradeBanner tier={tier} onUpgrade={upgrade} />
        </>
      )}

      <DetailSheet
        signal={sheet?.signal ?? null}
        subscription={feed.subscription}
        mode={sheet?.mode ?? "detail"}
        onClose={() => setSheet(null)}
        onOutreach={() =>
          setSheet((s) => (s ? { ...s, mode: "outreach" } : s))
        }
        onToast={showToast}
      />

      {toast && (
        <div className="fixed bottom-[26px] left-1/2 z-[120] -translate-x-1/2 rounded-full bg-accent px-[20px] py-[11px] text-[13px] font-bold text-black shadow-[0_14px_40px_rgba(0,0,0,.5)]">
          {toast}
        </div>
      )}
    </>
  );
}