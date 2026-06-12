import { actUrgency } from "@/lib/archetypes";

const URGENCY_STYLES = {
  urgent: "bg-lime/10 text-lime border-lime/25",
  soon: "bg-mint/10 text-mint border-mint/20",
  plan: "bg-cyan/10 text-cyan border-cyan/20",
} as const;

export default function ActPill({ days }: { days: number }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-[7px] rounded-full border px-[13px] py-[5px] text-[10px] font-bold uppercase tracking-[0.06em] ${URGENCY_STYLES[actUrgency(days)]}`}
    >
      <span className="h-[5px] w-[5px] rounded-full bg-current" />
      Act in {days} days
    </span>
  );
}
