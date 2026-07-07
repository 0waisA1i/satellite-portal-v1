"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GatedFeed, Subscription, Tier, VisibleSignal } from "@/lib/types";
import { archetypeAccent } from "@/lib/archetypes";
import DetailSheet, { type SheetMode } from "./DetailSheet";
import EnrichPanel from "./EnrichPanel";
import SignalCard from "./SignalCard";
import UpgradeBanner from "./UpgradeBanner";
import { LockIcon } from "./icons";

// Realistic-looking placeholder signals used when real teasers run out (e.g.
// Stack tier where all signals fit within the cap). Shown blurred, so only the
// visual structure — company name, archetype rail color, confidence bar — needs
// to read as credible.
const PLACEHOLDER_SIGNALS: VisibleSignal[] = [
  {
    id: "00000000-0000-0000-0000-000000000000",
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
    id: "00000000-0000-0000-0000-000000000001",
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

// Compact strip showing one chip per archetype with active signal count.
// Kathairos-only: rendered above the signal list when client.id === "kathairos".
function ArchetypeStrip({ signals }: { signals: VisibleSignal[] }) {
  const counts: Record<string, number> = {};
  for (const s of signals) {
    if (s.status === "active") {
      counts[s.archetype] = (counts[s.archetype] ?? 0) + 1;
    }
  }
  const archetypes = Object.keys(counts);
  if (archetypes.length === 0) return null;
  return (
    <div className="mb-[14px] flex flex-wrap gap-[8px]">
      {archetypes.map((a) => {
        const hex = archetypeAccent(a);
        return (
          <span
            key={a}
            className="inline-flex items-center gap-[8px] rounded-full border px-[12px] py-[5px] text-[10.5px] font-semibold"
            style={{ color: hex, borderColor: `${hex}30`, background: `${hex}0d` }}
          >
            <span
              className="inline-block h-[6px] w-[6px] shrink-0 rounded-full"
              style={{ background: hex }}
            />
            {a}
            <span
              className="rounded-full px-[6px] py-[1px] text-[9.5px] font-bold"
              style={{ background: `${hex}22`, color: hex }}
            >
              {counts[a]}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function LockedCard({
  signal,
  subscription,
  hideVolume,
}: {
  signal: VisibleSignal;
  subscription: Subscription;
  hideVolume: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line/50">
      {/* Blurred signal content — higher brightness so archetype colors bleed through */}
      <div className="pointer-events-none select-none blur-[6px] brightness-[0.62]">
        <SignalCard
          signal={signal}
          subscription={subscription}
          hideVolume={hideVolume}
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
  const [enrichSignal, setEnrichSignal] = useState<VisibleSignal | null>(null);
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
  const isKathairos = feed.client.id === "kathairos";

  // Always exactly 1 teaser card; fall back to a placeholder if real teasers
  // run out (e.g. Stack tier where all signals fit within the cap).
  const teaserSignal: VisibleSignal =
    feed.teaserSignals[0] ?? PLACEHOLDER_SIGNALS[0];

  return (
    <>
      {isKathairos && <ArchetypeStrip signals={feed.signals} />}

      <div className="flex flex-col gap-[14px]">
        {feed.signals.map((s) => (
          <SignalCard
            key={s.signal_id}
            signal={s}
            subscription={feed.subscription}
            hideVolume={isKathairos}
            onDetail={() => setSheet({ signal: s, mode: "detail" })}
            onEnrich={() =>
              isKathairos
                ? showToast("Enrichment runs in a later version")
                : setEnrichSignal(s)
            }
            onOutreach={() => setSheet({ signal: s, mode: "outreach" })}
            onCrm={() => showToast("CRM push runs in later version")}
          />
        ))}
      </div>

      {tier !== "command" && (
        <>
          <div className="mt-[14px]">
            <LockedCard
              signal={teaserSignal}
              subscription={feed.subscription}
              hideVolume={isKathairos}
            />
          </div>
          <UpgradeBanner tier={tier} onUpgrade={upgrade} />
        </>
      )}

      <EnrichPanel
        signal={enrichSignal}
        onClose={() => setEnrichSignal(null)}
      />

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