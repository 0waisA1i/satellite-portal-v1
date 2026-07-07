"use client";

import * as XLSX from "xlsx";
import type { VisibleSignal } from "@/lib/types";

function parseDomain(url: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const HEADERS = [
  "Company",
  "Domain",
  "Signal Type",
  "Confidence",
  "Tier",
  "Status",
  "Days Until Stale",
  "Last Seen",
  "Source URL",
  "Suggested Next Step",
  "Target Persona",
];

function toWorkbook(signals: VisibleSignal[]): XLSX.WorkBook {
  const rows = signals.map((s) => [
    s.account.name,
    parseDomain(s.source_url),
    s.archetype,
    s.confidence_current,
    s.trigger_label.replace(/·/g, "-"),
    s.status,
    s.act_within_days,
    s.deadline_date,
    s.source_url,
    s.suggested_next_step,
    s.target_titles.join("; "),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);

  // Apply bold to every header cell explicitly
  for (let col = 0; col < HEADERS.length; col++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[addr]) {
      ws[addr] = { t: "s", v: HEADERS[col] };
    }
    ws[addr].s = { font: { bold: true } };
  }

  // Fixed column width of 20 characters for all columns
  ws["!cols"] = HEADERS.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Signals");
  return wb;
}

export default function ExportCsvButton({
  signals,
  period,
}: {
  signals: VisibleSignal[];
  period: string;
}) {
  function handleExport() {
    const wb = toWorkbook(signals);

    // Use XLSX.write with type:'array' + manual Blob for reliable style output in browsers
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
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-[6px] rounded-[8px] bg-[#E8E8E8] px-[13px] py-[6px] text-[11px] font-semibold text-black transition hover:bg-[#D8D8D8]"
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
      Export Excel
    </button>
  );
}
