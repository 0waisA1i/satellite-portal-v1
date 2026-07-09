import type { AccentName } from "./types";

export const ACCENT_HEX: Record<AccentName, string> = {
  lime: "#ECFD95",
  mint: "#CBF3BA",
  cyan: "#40E3FD",
  grey: "#C1C1C1",
};

// Ordered accent palette for sequential assignment by index (e.g. archetype strip).
// Index 0 = lime, 1 = mint, 2 = cyan, 3+ = coral fallback.
export const ACCENT_SEQUENCE = ["#ECFD95", "#CBF3BA", "#40E3FD", "#FF8585"] as const;

// Each archetype gets a distinct accent (CLAUDE.md): Gold-tier archetypes get
// lime/mint, Silver channel cyan, Silver monitoring grey. Keyed by the human
// label we display on the rail (the live DB stores coded archetypes like "A1";
// see CODE_TO_ARCHETYPE below, which resolves codes to these labels).
const ARCHETYPE_STYLES: Record<string, { accent: AccentName; tier: "gold" | "silver" }> = {
  // Sample-data archetype names.
  "Regulatory Enforcement": { accent: "lime", tier: "gold" },
  "Permit / Project Filing": { accent: "mint", tier: "gold" },
  "Capacity / Infrastructure RFP": { accent: "lime", tier: "gold" },
  "Decarbonization Commitment": { accent: "cyan", tier: "silver" },
  "Initiative-Linked Hire": { accent: "grey", tier: "silver" },
  // Live Kathairos archetypes (from icp_configs.config.archetypes).
  "Pneumatic Methane Regulatory Deadline": { accent: "lime", tier: "gold" },
  "Greenfield Pad / Well Permit": { accent: "mint", tier: "gold" },
  "Operator-Linked Methane Plume / Enforcement": { accent: "cyan", tier: "silver" },
  "Methane Programs Hiring + Public Commitment": { accent: "grey", tier: "silver" },
};

// Live `signals.archetype` is a code (A1..A4). Resolve to the human label we
// render and key styling off of. Source: icp_configs.config.archetypes.
export const CODE_TO_ARCHETYPE: Record<string, string> = {
  A1: "Pneumatic Methane Regulatory Deadline",
  A2: "Greenfield Pad / Well Permit",
  A3: "Operator-Linked Methane Plume / Enforcement",
  A4: "Methane Programs Hiring + Public Commitment",
};

export function archetypeLabel(codeOrName: string): string {
  return CODE_TO_ARCHETYPE[codeOrName] ?? codeOrName;
}

export function archetypeStyle(archetype: string) {
  return ARCHETYPE_STYLES[archetype] ?? { accent: "grey" as const, tier: "silver" as const };
}

export function archetypeAccent(archetype: string): string {
  return ACCENT_HEX[archetypeStyle(archetype).accent];
}

// Standardized act-window urgency (CLAUDE.md): <=30 days lime, <=60 mint, beyond cyan.
export function actUrgency(days: number): "urgent" | "soon" | "plan" {
  return days <= 30 ? "urgent" : days <= 60 ? "soon" : "plan";
}

export function formatDeadline(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  if (!y || !m) return period;
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}
