import { useEffect, useState } from "react";

type EmergenceResponse = {
  window_size: number;
  last_score: number | null;
  critical_rate: number;
  drift: {
    drifting: boolean;
    ewma: number | null;
    deviation: number;
    threshold: number;
    mean: number;
    std: number;
  };
  alert?: {
    level: "normal" | "high" | "critical";
    reasons: string[];
  };
};

const DEFAULT_WINDOW = 50;

function alertPillClass(level: "normal" | "high" | "critical"): string {
  const base = "inline-flex items-center rounded-2xl px-4 py-2 text-sm font-bold backdrop-blur-sm transition-all duration-300";
  if (level === "critical") {
    return base + " bg-gradient-to-r from-rose-500/30 to-red-500/30 text-rose-200 border border-rose-500/50 shadow-[0_0_40px_rgba(248,113,113,0.35)]";
  }
  if (level === "high") {
    return base + " bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-200 border border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.35)]";
  }
  return base + " bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 text-emerald-200 border border-emerald-500/40 shadow-[0_0_20px_rgba(34,211,238,0.15)]";
}

function MetricBlock({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
      <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">{label}</div>
      <div className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent mb-2">{value}</div>
      <div className="text-sm text-slate-500 font-medium">{hint}</div>
    </div>
  );
}

export function EmergenceDashboard() {
  const [data, setData] = useState<EmergenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [windowSize, setWindowSize] = useState(DEFAULT_WINDOW);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmergence(windowSize);
  }, []);

  async function fetchEmergence(windowParam: number) {
    try {
      setLoading(true);
      setError(null);
      const url = `/make-server-f9ece59c/emergence?window=${windowParam}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as EmergenceResponse;
      const alertLevel: "normal" | "high" | "critical" = json.drift?.drifting
        ? json.critical_rate > 0.3
          ? "critical"
          : "high"
        : "normal";
      const enriched = {
        ...json,
        alert: {
          level: alertLevel,
          reasons: [],
        },
      };
      setData(enriched);
    } catch (e) {
      setError("Failed to load emergence metrics.");
    } finally {
      setLoading(false);
    }
  }

  const alertLevel = data?.alert?.level ?? "normal";
  const alertReasons = data?.alert?.reasons ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
        <div className="flex-1 rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Emergence Alert</div>
          <div className="flex items-center gap-3 mb-4">
            <span className={alertPillClass(alertLevel)}>{alertLevel.toUpperCase()}</span>
            <span className="text-sm text-slate-400 font-medium">{data ? `Window ${data.window_size}` : "No data yet"}</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {alertReasons.length === 0 && <li className="text-slate-500 font-medium">Awaiting reasons.</li>}
            {alertReasons.map((r, idx) => (
              <li key={idx} className="flex gap-3 items-center">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                <span className="font-medium">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Reality Index</div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent">{data?.last_score?.toFixed(2) ?? "--"}</span>
            <span className="text-sm text-slate-400 font-medium">last score</span>
          </div>
          <div className="text-sm text-slate-400 font-medium">Composite measure across SYMBI dimensions.</div>
        </div>

        <div className="flex-1 rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Critical Rate</div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent">{data ? (data.critical_rate * 100).toFixed(1) : "--"}%</span>
            <span className="text-sm text-slate-400 font-medium">of recent events</span>
          </div>
          <div className="text-sm text-slate-400 font-medium">Fraction entering critical state in the window.</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr),minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Drift State</div>
              <p className="text-base text-slate-200 font-medium">
                {data ? (data.drift.drifting ? "Drift detected." : "No significant drift.") : "Awaiting metrics…"}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <label className="text-slate-400 font-medium">Window</label>
              <select
                className="rounded-2xl border border-slate-700/50 bg-gradient-to-r from-slate-900/60 to-indigo-900/30 px-4 py-2 text-sm text-slate-200 backdrop-blur-sm"
                value={windowSize}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setWindowSize(w);
                  fetchEmergence(w);
                }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="h-48 rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center text-sm text-slate-500 font-medium backdrop-blur-sm">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center mb-3 mx-auto">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-400" />
              </div>
              <div>Drift visualization</div>
              <div className="text-xs text-slate-600 mt-1">Enhanced chart component</div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
            <MetricBlock label="EWMA" value={data?.drift.ewma != null ? data.drift.ewma.toFixed(3) : "--"} hint="Moving average" />
            <MetricBlock label="Deviation" value={data ? data.drift.deviation.toFixed(3) : "--"} hint="From mean" />
            <MetricBlock label="Threshold" value={data ? data.drift.threshold.toFixed(3) : "--"} hint="Boundary" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">How to read this</h3>
            <p className="text-base text-slate-200 font-medium leading-relaxed">Time-series analysis of agent behaviour versus historical baseline.</p>
            <p className="mt-4 text-sm text-slate-400 font-medium">Plug into dashboards or trust consoles.</p>
          </div>
          <div className="rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-slate-100 text-sm">API Debug</span>
              <button className="rounded-2xl border border-slate-700/50 bg-gradient-to-r from-slate-900/60 to-indigo-900/30 px-4 py-2 text-sm text-slate-300 hover:border-cyan-400/50 hover:text-cyan-200 transition-all duration-300 backdrop-blur-sm" onClick={() => window.location.reload()}>Refresh</button>
            </div>
            <p className="text-sm text-slate-400 font-medium mb-4">GET <code className="text-cyan-300">/make-server-f9ece59c/emergence?window={windowSize}</code></p>
            {loading && <p className="text-cyan-300 font-medium flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />Loading…</p>}
            {error && <p className="text-rose-400 font-medium flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" />{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}