import Link from "next/link";
import type { Tier } from "@/lib/types";

const PLANS: { tier: Tier; label: string }[] = [
  { tier: "feed", label: "Feed" },
  { tier: "stack", label: "Stack" },
  { tier: "command", label: "Command" },
];

// Demo-only control while we run without real entitlements. One view (Signal
// Satellite) is shown for every plan; this toggle previews which feature
// actions each plan unlocks. The plan flows through the URL into the
// server-side gate, so nothing is unlocked in the browser. `basePath` keeps the
// toggle on the current route ("/" live or "/demo" sample). Replaced by the
// real subscription row once Supabase auth is wired.
export default function DemoBar({
  tier,
  basePath = "/",
}: {
  tier: Tier;
  basePath?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-[14px] border-b border-line bg-lime/[0.04] px-[26px] py-[10px]">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-txt-3">
        Preview plan
      </span>
      <div className="flex gap-[2px] rounded-[10px] border border-line bg-panel p-[3px]">
        {PLANS.map((p) => (
          <Link
            key={p.tier}
            href={`${basePath}?tier=${p.tier}`}
            className={`rounded-[7px] px-[16px] py-[6px] text-[12px] font-semibold transition ${
              p.tier === tier ? "bg-accent text-black" : "text-txt-3"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>
      <span className="text-[11px] text-txt-4">
        Demo control: toggle to see which features each plan unlocks
      </span>
    </div>
  );
}
