import type { Subscription, VisibleSignal } from "@/lib/types";
import { archetypeAccent, formatDeadline } from "@/lib/archetypes";
import ActPill from "./ActPill";
import ArchetypeRail from "./ArchetypeRail";
import ContactRow from "./ContactRow";
import { InfoIcon, LockIcon, PenIcon, SlackIcon, SparkIcon } from "./icons";

const btn =
  "inline-flex items-center gap-[7px] rounded-[9px] px-[15px] py-[9px] text-[12px] font-semibold transition";
export const btnGhost = `${btn} border border-line-2 bg-panel hover:border-white/30 hover:bg-panel-2`;
export const btnAccent = `${btn} bg-accent text-black hover:brightness-110`;
const btnLock = `${btn} cursor-not-allowed border border-dashed border-line-2 bg-white/[0.025] text-txt-4`;

function LockedAction({ label }: { label: string }) {
  return (
    <span className="group relative">
      <button className={btnLock} disabled>
        <LockIcon className="h-[14px] w-[14px] opacity-60" />
        {label}
      </button>
      <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-line-2 bg-[#0b0b0b] px-[11px] py-[7px] text-[10px] font-semibold tracking-[0.02em] text-accent opacity-0 shadow-[0_12px_30px_rgba(0,0,0,.7)] transition group-hover:opacity-100">
        Signal Stack →
      </span>
    </span>
  );
}

export default function SignalCard({
  signal,
  subscription,
  onDetail,
  onEnrich,
  onOutreach,
  onSlack,
}: {
  signal: VisibleSignal;
  subscription: Subscription;
  onDetail: () => void;
  onEnrich: () => void;
  onOutreach: () => void;
  onSlack: () => void;
}) {
  const accent = archetypeAccent(signal.archetype);
  const enriched = subscription.enrich_enabled && signal.contacts;

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
              <div className="min-w-[66px] rounded-[10px] border border-line bg-white/[0.04] px-[14px] py-[9px] text-center">
                <span className="block text-[13px] font-bold leading-none tracking-[-0.02em]">
                  {signal.est_volume}
                </span>
                <span className="mt-[4px] block text-[6.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                  30-day vol
                </span>
              </div>
            </div>
          </div>

          {/* mid: act pill + decision-makers */}
          <div className="mt-[15px] flex items-center gap-[12px] border-t border-line pt-[14px] max-md:flex-col max-md:items-start">
            <ActPill days={signal.act_within_days} />
            <div className="min-w-0 flex-1">
              <div className="mb-[4px] text-[8px] font-bold uppercase tracking-[0.13em] text-txt-3">
                Decision-makers to reach{enriched ? " · enriched" : ""}
              </div>
              {enriched ? (
                signal.contacts!.map((c) => <ContactRow key={c.name} contact={c} />)
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

          {/* actions */}
          <div className="mt-[15px] flex flex-wrap items-center gap-[9px] border-t border-line pt-[14px]">
            <button className={btnAccent} onClick={onDetail}>
              <InfoIcon />
              View signal detail
            </button>
            {subscription.enrich_enabled ? (
              <button className={btnGhost} onClick={onEnrich}>
                <SparkIcon />
                Find &amp; enrich
              </button>
            ) : (
              <LockedAction label="Find & enrich" />
            )}
            {subscription.outreach_enabled ? (
              <button className={btnGhost} onClick={onOutreach}>
                <PenIcon />
                Generate outreach
              </button>
            ) : (
              <LockedAction label="Generate outreach" />
            )}
            {subscription.slack_enabled && (
              <button className={btnGhost} onClick={onSlack}>
                <SlackIcon />
                Push to Slack
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

          <div className="mt-[11px] flex items-baseline gap-[6px] text-[8.5px] leading-[1.4] text-txt-3">
            <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.1em] text-alert">
              Filtered out
            </span>
            <span>{signal.false_positive_filter}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
