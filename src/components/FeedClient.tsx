"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GatedFeed, Tier, VisibleSignal } from "@/lib/types";
import DetailSheet, { type SheetMode } from "./DetailSheet";
import SignalCard from "./SignalCard";
import UpgradeBanner from "./UpgradeBanner";

export default function FeedClient({ feed }: { feed: GatedFeed }) {
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
    router.push(`/?tier=${to}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="flex flex-col gap-[14px]">
        {feed.signals.map((s) => (
          <SignalCard
            key={s.signal_id}
            signal={s}
            subscription={feed.subscription}
            onDetail={() => setSheet({ signal: s, mode: "detail" })}
            onEnrich={() =>
              showToast("Enrichment runs in a later version")
            }
            onOutreach={() => setSheet({ signal: s, mode: "outreach" })}
            onCrm={() =>
              showToast(`Pushed "${s.account.name}" to your CRM as a task`)
            }
          />
        ))}
      </div>

      <UpgradeBanner tier={feed.subscription.tier} onUpgrade={upgrade} />

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
