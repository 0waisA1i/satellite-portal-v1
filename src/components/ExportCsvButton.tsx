"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import type { VisibleSignal } from "@/lib/types";
import { fetchContactsForExport, type ExportContactRow } from "@/app/actions";

function parseDomain(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function boldHeaders(ws: XLSX.WorkSheet, headers: string[]) {
  for (let col = 0; col < headers.length; col++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[addr]) ws[addr] = { t: "s", v: headers[col] };
    ws[addr].s = { font: { bold: true } };
  }
  ws["!cols"] = headers.map(() => ({ wch: 20 }));
}

const SIGNAL_HEADERS = [
  "Signal ID",
  "Company",
  "Domain",
  "Signal Type",
  "Tier",
  "Confidence",
  "Status",
  "Days Until Stale",
  "Last Seen",
  "Signal Intelligence",
  "Why Now",
  "Outreach Angle",
  "Suggested Next Step",
  "Target Persona",
  "Source URL",
];

const CONTACT_HEADERS = [
  "Signal ID",
  "Company",
  "Archetype",
  "Name",
  "Title",
  "Email",
  "LinkedIn",
];

function makeSignalsSheet(signals: VisibleSignal[]): XLSX.WorkSheet {
  const rows = signals.map((s) => [
    s.signal_id,
    s.account.name,
    parseDomain(s.source_url),
    s.archetype,
    s.trigger_label.replace(/·/g, "-"),
    s.confidence_current,
    s.status,
    s.act_within_days,
    s.deadline_date,
    s.summary,
    s.why_now,
    s.outreach_angle,
    s.suggested_next_step,
    s.target_titles.join("; "),
    s.source_url,
  ]);
  const ws = XLSX.utils.aoa_to_sheet([SIGNAL_HEADERS, ...rows]);
  boldHeaders(ws, SIGNAL_HEADERS);
  return ws;
}

function makeContactsSheet(contacts: ExportContactRow[]): XLSX.WorkSheet {
  const rows = contacts.map((c) => [
    c.signal_id,
    c.company,
    c.archetype,
    c.name,
    c.title,
    c.email,
    c.linkedin_url,
  ]);
  const ws = XLSX.utils.aoa_to_sheet([CONTACT_HEADERS, ...rows]);
  boldHeaders(ws, CONTACT_HEADERS);
  return ws;
}

export default function ExportCsvButton({
  signals,
  period,
}: {
  signals: VisibleSignal[];
  period: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const contacts = await fetchContactsForExport();

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, makeSignalsSheet(signals), "Signals");
      // contacts is null for signal_feed clients; omit tab entirely.
      // For stack/command, only add the tab if at least one contact exists.
      if (contacts && contacts.length > 0) {
        XLSX.utils.book_append_sheet(wb, makeContactsSheet(contacts), "Contacts");
      }

      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signals-${period}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-[6px] rounded-[8px] bg-[#E8E8E8] px-[13px] py-[6px] text-[11px] font-semibold text-black transition hover:bg-[#D8D8D8] disabled:opacity-60"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-[12px] w-[12px]"
      >
        <path d="M8 2v8M5 7l3 3 3-3M3 12h10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {loading ? "Exporting…" : "Export Excel"}
    </button>
  );
}
