import Link from "next/link";
import type { Tier } from "@/lib/types";

const TIERS: { tier: Tier; label: string }[] = [
  { tier: "feed", label: "Signal Feed" },
  { tier: "stack", label: "Signal Stack" },
  { tier: "command", label: "Signal Command" },
];

// Demo-only control while we run on sample data: the tier flows through the
// URL into the server-side gate, so each toggle re-renders with re-gated data
// (nothing is unlocked in the browser). Replaced by the real subscription row
// once Supabase auth is wired.
export default function DemoBar({ tier }: { tier: Tier }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-[14px] border-b border-line bg-lime/[0.04] px-[26px] py-[10px]">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-txt-3">
        Preview tier
      </span>
      <div className="flex gap-[2px] rounded-[10px] border border-line bg-panel p-[3px]">
        {TIERS.map((t) => (
          <Link
            key={t.tier}
            href={`/?tier=${t.tier}`}
            className={`rounded-[7px] px-[16px] py-[6px] text-[12px] font-semibold transition ${
              t.tier === tier ? "bg-accent text-black" : "text-txt-3"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <span className="text-[11px] text-txt-4">
        Demo control: toggle to see what each subscription tier unlocks
      </span>
    </div>
  );
}
