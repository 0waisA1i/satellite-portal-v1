import type { AccentName } from "./types";

export const ACCENT_HEX: Record<AccentName, string> = {
  lime: "#ECFD95",
  mint: "#CBF3BA",
  cyan: "#40E3FD",
  grey: "#C1C1C1",
};

// Each archetype gets a distinct accent (CLAUDE.md): Gold-tier archetypes get
// lime/mint, Silver channel cyan, Silver monitoring grey. The live DB carries
// archetype_tier; until then this map covers the known archetypes.
const ARCHETYPE_STYLES: Record<string, { accent: AccentName; tier: "gold" | "silver" }> = {
  "Regulatory Enforcement": { accent: "lime", tier: "gold" },
  "Permit / Project Filing": { accent: "mint", tier: "gold" },
  "Capacity / Infrastructure RFP": { accent: "lime", tier: "gold" },
  "Decarbonization Commitment": { accent: "cyan", tier: "silver" },
  "Initiative-Linked Hire": { accent: "grey", tier: "silver" },
};

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
