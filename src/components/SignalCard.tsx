import type { Subscription, VisibleSignal } from "@/lib/types";
import { archetypeAccent, formatDeadline } from "@/lib/archetypes";
import ActPill from "./ActPill";
import ArchetypeRail from "./ArchetypeRail";
import ContactRow from "./ContactRow";
import { ArchiveIcon, CrmIcon, InfoIcon, LockIcon, PenIcon, RestoreIcon, SparkIcon } from "./icons";

const btn =
  "inline-flex items-center gap-[7px] rounded-[9px] px-[15px] py-[9px] text-[12px] font-semibold transition";
export const btnGhost = `${btn} border border-line-2 bg-panel hover:border-white/30 hover:bg-panel-2`;
export const btnAccent = `${btn} bg-accent text-black hover:brightness-110`;

// One button shape for every feature. Unlocked = a normal ghost button.
// Locked = the same button, dimmed, with a small lock and a tooltip naming
// the plan that unlocks it. Subtle, never hidden.
function FeatureButton({
  icon,
  label,
  unlocked,
  unlockLabel,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  unlocked: boolean;
  unlockLabel: string;
  onClick: () => void;
}) {
  if (unlocked) {
    return (
      <button className={btnGhost} onClick={onClick}>
        {icon}
        {label}
      </button>
    );
  }
  return (
    <span className="group relative">
      <button
        className={`${btn} cursor-not-allowed border border-line bg-white/[0.02] text-txt-4`}
        disabled
      >
        <LockIcon className="h-[13px] w-[13px] opacity-70" />
        {label}
      </button>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-line-2 bg-[#0b0b0b] px-[11px] py-[7px] text-[10px] font-semibold tracking-[0.02em] text-accent opacity-0 shadow-[0_12px_30px_rgba(0,0,0,.7)] transition group-hover:opacity-100">
        {unlockLabel} →
      </span>
    </span>
  );
}

export default function SignalCard({
  signal,
  subscription,
  hideVolume = false,
  onDetail,
  onEnrich,
  onOutreach,
  onCrm,
  onArchive,
  onRestore,
}: {
  signal: VisibleSignal;
  subscription: Subscription;
  hideVolume?: boolean;
  onDetail: () => void;
  onEnrich: () => void;
  onOutreach: () => void;
  onCrm: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}) {
  const accent = archetypeAccent(signal.archetype);
  const anyEnriched = subscription.enrich_enabled;

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-panel transition hover:border-line-2 hover:bg-white/5">
      <div className="flex items-stretch max-md:flex-col">
        <ArchetypeRail
          archetype={signal.archetype}
          strength={signal.confidence_current}
          accent={accent}
        />

        <div className="min-w-0 flex-1 p-[22px] pb-[16px] pt-[18px]">
          {/* top: account + stat chips */}
          <div className="flex items-start justify-between gap-[18px] max-md:flex-col">
            <div className="min-w-0 flex-1">
              <div className="text-[20px] font-semibold leading-[1.15] tracking-[-0.015em]">
                {signal.account.name}
              </div>
              <div className="mt-[3px] text-[12.5px] leading-[1.4] text-txt-2">
                {signal.account.sector} · {signal.account.geo}
              </div>
              <div className="mt-[11px] flex flex-wrap items-center gap-[9px]">
                <span className="rounded-full border border-line-2 bg-panel px-[10px] py-[3px] text-[9.5px] font-semibold uppercase tracking-[0.05em] text-txt-2">
                  {signal.trigger_label}
                </span>
                <span className="text-[9.5px] text-txt-3">
                  <b className="font-bold tracking-[0.04em] text-accent">
                    WHY NOW
                  </b>{" "}
                  · {signal.why_now}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 gap-[7px] max-md:w-full max-md:justify-between">
              <div className="min-w-[66px] rounded-[10px] border border-line bg-white/[0.04] px-[14px] py-[9px] text-center">
                <span className="block text-[18px] font-bold leading-none tracking-[-0.02em]">
                  {formatDeadline(signal.deadline_date)}
                </span>
                <span className="mt-[4px] block text-[6.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                  Deadline
                </span>
              </div>
              {!hideVolume && (
                <div className="min-w-[66px] rounded-[10px] border border-line bg-white/[0.04] px-[14px] py-[9px] text-center">
                  <span className="block text-[13px] font-bold leading-none tracking-[-0.02em]">
                    {signal.est_volume}
                  </span>
                  <span className="mt-[4px] block text-[6.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                    30-day vol
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* mid: act pill + decision-makers */}
          <div className="mt-[15px] flex items-center gap-[12px] border-t border-line pt-[14px] max-md:flex-col max-md:items-start">
            <ActPill days={signal.act_within_days} />
            <div className="min-w-0 flex-1">
              <div className="mb-[4px] text-[8px] font-bold uppercase tracking-[0.13em] text-txt-3">
                Decision-makers to reach{anyEnriched ? " · enriched" : ""}
              </div>
              {signal.contacts.length > 0 ? (
                signal.contacts.map((c, i) => (
                  <ContactRow key={`${c.title}-${i}`} contact={c} />
                ))
              ) : (
                <div className="flex flex-wrap items-center gap-[7px]">
                  {signal.target_titles.map((t) => (
                    <span
                      key={t}
                      className="rounded-[7px] border border-line bg-white/5 px-[9px] py-[3px] text-[11px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-[6px] text-[11px] leading-[1.4] text-txt-2">
                {signal.outreach_angle}
              </div>
            </div>
          </div>

          {/* actions: all present, locked ones dimmed per plan */}
          <div className="mt-[15px] flex flex-wrap items-center gap-[9px] border-t border-line pt-[14px]">
            <button className={btnAccent} onClick={onDetail}>
              <InfoIcon />
              View signal detail
            </button>
            <FeatureButton
              icon={<SparkIcon />}
              label="Find & enrich"
              unlocked={subscription.enrich_enabled}
              unlockLabel="Signal Stack"
              onClick={onEnrich}
            />
            <FeatureButton
              icon={<PenIcon />}
              label="Generate outreach"
              unlocked={subscription.outreach_enabled}
              unlockLabel="Signal Stack"
              onClick={onOutreach}
            />
            <FeatureButton
              icon={<CrmIcon />}
              label="Push to CRM"
              unlocked={subscription.crm_enabled}
              unlockLabel="Signal Command"
              onClick={onCrm}
            />
            {onArchive && (
              <button
                className={`${btnGhost} ml-auto text-txt-3 hover:border-alert/40 hover:text-alert`}
                onClick={onArchive}
              >
                <ArchiveIcon />
                Mark as complete
              </button>
            )}
            {onRestore && (
              <button
                className={`${btnGhost} ml-auto text-txt-3 hover:border-accent/40 hover:text-accent`}
                onClick={onRestore}
              >
                <RestoreIcon />
                Restore
              </button>
            )}
            {signal.source_verified && (
              <a
                className="ml-auto whitespace-nowrap text-[9px] tracking-[0.03em] text-accent before:font-bold before:tracking-[0.1em] before:text-txt-4 before:content-['SOURCE_→_']"
                href={signal.source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                verified ↗
              </a>
            )}
          </div>

          {signal.false_positive_filter && (
            <div className="mt-[11px] flex items-baseline gap-[6px] text-[8.5px] leading-[1.4] text-txt-3">
              <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.1em] text-alert">
                Filtered out
              </span>
              <span>{signal.false_positive_filter}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
