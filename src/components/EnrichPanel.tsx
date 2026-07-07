"use client";

import { useEffect, useState } from "react";
import type { VisibleSignal } from "@/lib/types";
import { archetypeAccent } from "@/lib/archetypes";
import {
  fetchContactsForSignal,
  type EnrichedContact,
} from "@/app/actions";

function ContactCard({ contact }: { contact: EnrichedContact }) {
  const initials = contact.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="rounded-[11px] border border-line bg-white/[0.03] p-[16px]">
      <div className="flex items-center gap-[12px]">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-line-2 bg-gradient-to-br from-[#222] to-[#0d0d0d] text-[11px] font-bold text-txt-2">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold leading-tight">
            {contact.name}
          </div>
          {contact.title && (
            <div className="mt-[2px] text-[11px] text-txt-3">{contact.title}</div>
          )}
        </div>
        {contact.is_primary && (
          <span className="ml-auto shrink-0 rounded-full border border-lime/20 bg-lime/5 px-[8px] py-[2px] text-[8.5px] font-bold uppercase tracking-[0.08em] text-lime/70">
            Primary
          </span>
        )}
      </div>
      {(contact.email || contact.linkedin_url) && (
        <div className="mt-[12px] flex flex-wrap items-center gap-[12px] border-t border-line pt-[11px]">
          {contact.email && (
            <span className="font-mono text-[11px] text-txt-2">
              {contact.email}
            </span>
          )}
          {contact.linkedin_url && (
            <a
              href={contact.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[10px] font-bold tracking-[0.06em] text-cyan hover:underline"
            >
              LinkedIn ↗
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function EnrichPanel({
  signal,
  onClose,
}: {
  signal: VisibleSignal | null;
  onClose: () => void;
}) {
  const open = signal !== null;
  const [contacts, setContacts] = useState<EnrichedContact[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signal?.id) {
      setContacts([]);
      return;
    }
    setLoading(true);
    fetchContactsForSignal(signal.id)
      .then(setContacts)
      .catch(() => setContacts([]))
      .finally(() => setLoading(false));
  }, [signal?.id]);

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
              <div
                className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: accent }}
              >
                Find &amp; enrich · {signal.signal_id}
              </div>
              <div className="mt-[6px] text-[22px] font-semibold tracking-[-0.015em]">
                {signal.account.name}
              </div>
              <div className="mt-[3px] text-[12.5px] text-txt-2">
                {signal.title}
              </div>
            </div>

            <div className="px-[26px] pb-[40px] pt-[20px]">
              <div className="mb-[9px] flex items-center gap-[8px] text-[9px] font-bold uppercase tracking-[0.14em] text-txt-3">
                <span className="font-serif text-[15px] normal-case italic text-lime/70">
                  1
                </span>
                Contacts
              </div>

              {loading ? (
                <div className="py-[32px] text-center text-[12px] text-txt-3">
                  Loading...
                </div>
              ) : contacts.length > 0 ? (
                <div className="flex flex-col gap-[10px]">
                  {contacts.map((c) => (
                    <ContactCard key={c.id} contact={c} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-[10px] rounded-[12px] border border-line bg-white/[0.02] px-[24px] py-[32px] text-center">
                  <div className="text-[13px] font-semibold text-txt-2">
                    No contacts found
                  </div>
                  <div className="max-w-[260px] text-[12px] leading-[1.5] text-txt-3">
                    Enrichment for this signal is pending. Check back after the next scan.
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
