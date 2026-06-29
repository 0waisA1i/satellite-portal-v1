// `subscriptions` is not in the live schema yet — queries fall back to "—".
import { getServerSupabase } from "@/lib/supabase";
import type { ScanRunRow, SignalRow } from "@/lib/database.types";
import AdminTopBar from "@/components/AdminTopBar";

type SubRow = { tier: string; signal_cap: number; segment_count: number } | null;

function configVal(v: unknown): string {
  if (v == null) return "—";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const supabase = getServerSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: rows, error } = await supabase
    .from("icp_configs")
    .select("client_id, client_name")
    .order("client_id");

  if (error) {
    return (
      <p className="p-8 text-sm text-red-400">
        Failed to load clients: {error.message}
      </p>
    );
  }

  const clients = rows ?? [];
  const { client: activeParam } = await searchParams;
  const active = activeParam ?? clients[0]?.client_id ?? null;

  const [subResult, configResult, sigResult, scanResult] = active
    ? await Promise.all([
        db
          .from("subscriptions")
          .select("tier, signal_cap, segment_count")
          .eq("client_id", active)
          .maybeSingle(),
        supabase
          .from("icp_configs")
          .select("config")
          .eq("client_id", active)
          .maybeSingle(),
        supabase
          .from("signals")
          .select(
            "signal_id, company, archetype, archetype_tier, current_confidence, status, surfaced, last_seen",
          )
          .eq("client_id", active)
          .order("current_confidence", { ascending: false }),
        supabase
          .from("scan_runs")
          .select("id, run_date, signals_found, signals_new, signals_refreshed, signals_decayed, status, created_at")
          .eq("client_id", active)
          .order("created_at", { ascending: false })
          .limit(10),
      ])
    : [{ data: null }, { data: null }, { data: [] }, { data: [] }];

  const sub = subResult.data as SubRow;
  const cfg = ((configResult.data?.config as Record<string, unknown>) ?? {});
  const signals = (sigResult.data ?? []) as Pick<
    SignalRow,
    | "signal_id"
    | "company"
    | "archetype"
    | "archetype_tier"
    | "current_confidence"
    | "status"
    | "surfaced"
    | "last_seen"
  >[];
  const scanRuns = (scanResult.data ?? []) as Pick<
    ScanRunRow,
    | "id"
    | "run_date"
    | "signals_found"
    | "signals_new"
    | "signals_refreshed"
    | "signals_decayed"
    | "status"
    | "created_at"
  >[];

  return (
    <div className="min-h-screen bg-black text-white">
      <AdminTopBar clients={clients} active={active} />

      <div className="p-8">
      {active && (
        <div className="space-y-10">
          <h1 className="text-3xl font-semibold tracking-tight">{active}</h1>

          {/* Subscription stat chips */}
          <section>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              Subscription
            </p>
            <div className="flex flex-wrap gap-3">
              <Chip label="Tier" value={sub?.tier ?? "—"} />
              <Chip
                label="Signal cap"
                value={sub != null ? String(sub.signal_cap) : "—"}
              />
              <Chip
                label="Segments"
                value={sub != null ? String(sub.segment_count) : "—"}
              />
            </div>
          </section>

          {/* ICP config fields */}
          <section>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              ICP Configuration
            </p>
            <div className="grid max-w-[760px] grid-cols-2 gap-x-12 gap-y-7">
              <Field
                label="Best fit customers"
                value={configVal(cfg.best_fit_customers)}
              />
              <Field
                label="Primary geos"
                value={configVal(cfg.primary_geos)}
              />
              <Field
                label="Stage hypothesis"
                value={configVal(cfg.stage_hypothesis)}
              />
              <Field label="Top pains" value={configVal(cfg.top_pains)} />
            </div>
          </section>

          {/* Signals table */}
          <section>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              Signals · {signals.length}
            </p>
            {signals.length === 0 ? (
              <p className="text-sm text-white/30">No signals found.</p>
            ) : (
              <div className="overflow-x-auto rounded-[12px] border border-white/10">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      {[
                        "Signal ID",
                        "Company",
                        "Archetype",
                        "Tier",
                        "Confidence",
                        "Status",
                        "Surfaced",
                        "Last Seen",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-white/50"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map((sig) => (
                      <tr
                        key={sig.signal_id}
                        className="border-b border-white/[0.06] transition last:border-0 hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3 font-mono text-[11px] text-white/40">
                          {sig.signal_id}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">
                          {sig.company}
                        </td>
                        <td className="px-4 py-3 text-white/60">
                          {sig.archetype}
                        </td>
                        <td className="px-4 py-3 text-white/60">
                          {sig.archetype_tier}
                        </td>
                        <td
                          className={`px-4 py-3 font-bold tabular-nums ${
                            sig.current_confidence >= 75
                              ? "text-[#ECFD95]"
                              : "text-white/70"
                          }`}
                        >
                          {sig.current_confidence}
                        </td>
                        <td className="px-4 py-3 text-white/60">
                          {sig.status}
                        </td>
                        <td className="px-4 py-3 text-white/60">
                          {sig.surfaced == null
                            ? "—"
                            : sig.surfaced
                              ? "Yes"
                              : "No"}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-white/40">
                          {sig.last_seen}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Scan history */}
          <section>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              Scan History · last {scanRuns.length}
            </p>
            {scanRuns.length === 0 ? (
              <p className="text-sm text-white/30">No scan runs found.</p>
            ) : (
              <div className="overflow-x-auto rounded-[12px] border border-white/10">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      {["Date", "Signals Found", "New", "Refreshed", "Decayed", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-white/50"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scanRuns.map((run) => (
                      <tr
                        key={run.id}
                        className="border-b border-white/[0.06] transition last:border-0 hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3 font-mono text-[11px] text-white/60">
                          {run.run_date}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-white">
                          {run.signals_found ?? "—"}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-white/70">
                          {run.signals_new ?? "—"}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-white/70">
                          {run.signals_refreshed ?? "—"}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-white/70">
                          {run.signals_decayed ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-white/60">
                          {run.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-3">
      <span className="block text-[20px] font-bold leading-none tracking-tight text-[#ECFD95]">
        {value}
      </span>
      <span className="mt-[6px] block text-[10px] font-semibold uppercase tracking-[0.1em] text-white/40">
        {label}
      </span>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-[5px] text-[11px] font-semibold text-white/60">{label}</p>
      <p className="text-[13.5px] leading-relaxed text-white">{value}</p>
    </div>
  );
}
