"use client";

import { useEffect } from "react";
import type { Subscription, VisibleSignal } from "@/lib/types";
import { archetypeAccent } from "@/lib/archetypes";
import ActPill from "./ActPill";
import ContactRow from "./ContactRow";
import { LockIcon, PenIcon } from "./icons";
import { btnAccent, btnGhost } from "./SignalCard";

export type SheetMode = "detail" | "outreach";

function Sec({
  num,
  title,
  children,
  last,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`py-[18px] ${last ? "" : "border-b border-line"}`}>
      <div className="mb-[9px] flex items-center gap-[8px] text-[9px] font-bold uppercase tracking-[0.14em] text-txt-3">
        <span className="font-serif text-[15px] normal-case italic text-lime/70">
          {num}
        </span>
        {title}
      </div>
      {children}
    </div>
  );
}

function outreachDraft(s: VisibleSignal): string {
  const first = s.contacts?.[0]?.name.split(" ")[0] ?? "there";
  return `Subject: ${s.why_now}: quick thought for ${s.account.name}

Hi ${first},

Saw ${s.account.name}'s ${s.trigger_label.toLowerCase()} (${s.archetype.toLowerCase()}). With ${s.why_now.toLowerCase()} on the clock, most teams in your position are weighing how to get to documented compliance fast without pulling ops off-cycle.

We've helped comparable operators turn exactly this trigger into a defensible plan in weeks, not quarters. Worth a 20-minute look at how it maps to your situation?

Best,
[Your name]`;
}

export default function DetailSheet({
  signal,
  subscription,
  mode,
  onClose,
  onOutreach,
  onToast,
}: {
  signal: VisibleSignal | null;
  subscription: Subscription;
  mode: SheetMode;
  onClose: () => void;
  onOutreach: () => void;
  onToast: (msg: string) => void;
}) {
  const open = signal !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const accent = signal ? archetypeAccent(signal.archetype) : "#fff";

  return (
    <>
      <div
        className={`fixed inset-0 z-[80] bg-black/60 backdrop-blur-[3px] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed bottom-0 right-0 top-0 z-[90] w-[min(560px,94vw)] overflow-y-auto border-l border-line-2 bg-[#0a0a0a] shadow-[-30px_0_80px_rgba(0,0,0,.7)] transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {signal && (
          <>
            <div className="h-[3px] w-full" style={{ background: accent }} />
            <div className="relative border-b border-line p-[26px] pb-[18px] pt-[22px]">
              <button
                className="absolute right-[22px] top-[18px] flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-line bg-panel text-[16px] text-txt-2 hover:bg-panel-2"
                onClick={onClose}
              >
                ×
              </button>

              {mode === "detail" ? (
                <>
                  <div className="mb-[10px] flex flex-wrap items-center gap-[8px]">
                    <span
                      className="rounded-full border px-[11px] py-[3px] text-[9.5px] font-bold uppercase tracking-[0.07em]"
                      style={{
                        background: `${accent}1a`,
                        color: accent,
                        borderColor: `${accent}3a`,
                      }}
                    >
                      {signal.archetype}
                    </span>
                    <ActPill days={signal.act_within_days} />
                  </div>
                  <div className="text-[24px] font-semibold leading-[1.15] tracking-[-0.015em]">
                    {signal.account.name}
                  </div>
                  <div className="mt-[3px] text-[12.5px] text-txt-2">
                    {signal.account.sector} · {signal.account.geo}
                  </div>
                  <div className="mt-[15px] max-w-[260px]">
                    <div className="text-[7.5px] font-semibold uppercase tracking-[0.1em] text-txt-3">
                      Signal strength
                    </div>
                    <div className="mt-[3px] text-[21px] font-bold leading-none tracking-[-0.02em]">
                      {signal.confidence_current}
                      <span className="text-[11px] font-medium text-txt-3">
                        /100
                      </span>
                    </div>
                    <div className="mt-[7px] h-[6px] overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${signal.confidence_current}%`,
                          background: accent,
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: accent }}
                  >
                    Generated outreach · {signal.signal_id}
                  </div>
                  <div className="mt-[6px] text-[22px] font-semibold tracking-[-0.015em]">
                    {signal.account.name}
                  </div>
                  <div className="mt-[3px] text-[12.5px] text-txt-2">
                    Drafted on the {signal.archetype.toLowerCase()} trigger
                    {signal.contacts?.[0] ? ` · to ${signal.contacts[0].name}` : ""}
                  </div>
                </>
              )}
            </div>

            <div className="px-[26px] pb-[40px] pt-[8px]">
              {mode === "detail" ? (
                <>
                  <Sec num="1" title="Signal intelligence">
                    <div className="text-[13.5px] leading-[1.6] text-txt-2">
                      {signal.signal_intelligence}
                    </div>
                  </Sec>
                  <Sec num="2" title="Summary">
                    <div className="text-[13.5px] leading-[1.6] text-txt-2">
                      {signal.summary}
                    </div>
                  </Sec>
                  <Sec num="3" title="Why now">
                    <div className="text-[13.5px] leading-[1.6]">
                      {signal.why_now}, act within {signal.act_within_days}{" "}
                      days.
                    </div>
                  </Sec>
                  <Sec num="4" title="Suggested next step">
                    <div className="text-[13.5px] leading-[1.6] text-txt-2">
                      {signal.suggested_next_step}
                    </div>
                  </Sec>
                  {subscription.enrich_enabled && signal.contacts ? (
                    <Sec num="5" title="Enriched decision-makers">
                      {signal.contacts.map((c) => (
                        <ContactRow key={c.name} contact={c} />
                      ))}
                      <div className="mt-[12px]">
                        <button className={btnAccent} onClick={onOutreach}>
                          <PenIcon />
                          Generate outreach
                        </button>
                      </div>
                    </Sec>
                  ) : (
                    <Sec num="5" title="Decision-makers to reach">
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
                      <div className="mt-[9px] text-[11px] leading-[1.4] text-txt-2">
                        {signal.outreach_angle}
                      </div>
                      <div className="mt-[12px] flex items-center">
                        <button
                          className={`${btnGhost} cursor-not-allowed border-dashed text-txt-4`}
                          disabled
                        >
                          <LockIcon className="h-[14px] w-[14px] opacity-60" />
                          Find &amp; enrich named contacts
                        </button>
                        <span className="ml-[8px] text-[11px] text-txt-3">
                          Available on Signal Stack
                        </span>
                      </div>
                    </Sec>
                  )}
                  <Sec num="6" title="Signal facts">
                    <dl className="grid grid-cols-[130px_1fr] gap-x-[16px] gap-y-[8px] text-[12.5px]">
                      <dt className="font-semibold text-txt-3">Signal ID</dt>
                      <dd>{signal.signal_id}</dd>
                      <dt className="font-semibold text-txt-3">Trigger</dt>
                      <dd>{signal.trigger_label}</dd>
                      <dt className="font-semibold text-txt-3">
                        Signal strength
                      </dt>
                      <dd>{signal.confidence_current} / 100</dd>
                      <dt className="font-semibold text-txt-3">Act within</dt>
                      <dd>{signal.act_within_days} days</dd>
                      <dt className="font-semibold text-txt-3">Deadline</dt>
                      <dd>{signal.deadline_date}</dd>
                      <dt className="font-semibold text-txt-3">Est. volume</dt>
                      <dd>{signal.est_volume}</dd>
                    </dl>
                    <div className="mt-[8px] h-[7px] overflow-hidden rounded-full bg-white/[0.08]">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${signal.confidence_current}%`,
                          background: accent,
                        }}
                      />
                    </div>
                  </Sec>
                  <Sec num="7" title="Rank-boost flags">
                    <div className="flex flex-wrap gap-[6px]">
                      {signal.rank_boost_flags.map((f) => (
                        <span
                          key={f}
                          className="rounded-[7px] border border-mint/15 bg-mint/5 px-[9px] py-[4px] text-[10px] font-semibold text-mint"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </Sec>
                  <Sec num="8" title="False-positive filter" last>
                    <div className="text-[13.5px] leading-[1.6] text-txt-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-alert">
                        Suppressed →{" "}
                      </span>
                      {signal.false_positive_filter}
                    </div>
                  </Sec>
                </>
              ) : (
                <>
                  <Sec num="→" title="Angle">
                    <div className="text-[13.5px] leading-[1.6]">
                      {signal.outreach_angle}
                    </div>
                  </Sec>
                  <Sec num="✎" title="Draft email">
                    <pre className="whitespace-pre-wrap rounded-[10px] border border-line bg-white/[0.03] p-[16px] font-sans text-[13px] leading-[1.6]">
                      {outreachDraft(signal)}
                    </pre>
                    <div className="mt-[12px] flex gap-[9px]">
                      <button
                        className={btnAccent}
                        onClick={() => {
                          navigator.clipboard.writeText(outreachDraft(signal));
                          onToast("Copied to clipboard");
                        }}
                      >
                        Copy
                      </button>
                      <button
                        className={btnGhost}
                        onClick={() => onToast("Pushed to CRM as a task")}
                      >
                        Push to CRM
                      </button>
                    </div>
                  </Sec>
                  <div className="py-[18px] text-[11.5px] text-txt-3">
                    Stub draft. In production this is generated per-signal from
                    the trigger, the account context, and your messaging
                    guardrails (Stage 10).
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
