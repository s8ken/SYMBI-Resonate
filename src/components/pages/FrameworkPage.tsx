import { useState } from "react";

type FrameworkResult = {
  realityIndex: number;
  trustProtocol: "PASS" | "PARTIAL" | "FAIL";
  ethicalAlignment: number;
  resonanceQuality: "STRONG" | "ADVANCED" | "BREAKTHROUGH";
  canvasParity: number;
  strengths: string[];
  weaknesses: string[];
};

function ScorePill({ label, value, suffix, variant = "solid" }: { label: string; value: string; suffix?: string; variant?: "solid" | "outline" | "gradient" }) {
  const base = "flex flex-col gap-2 rounded-2xl border px-4 py-3 text-sm text-slate-200 backdrop-blur-sm transition-all duration-300";
  const style = variant === "gradient" 
    ? "border-cyan-500/40 bg-gradient-to-br from-cyan-900/40 via-indigo-900/20 to-slate-900/60 shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30" 
    : variant === "outline" 
      ? "border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-indigo-900/20 hover:border-cyan-500/40" 
      : "border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-indigo-900/30 hover:border-cyan-500/30";
  return (
    <div className={base + " " + style}>
      <span className="text-sm font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="text-base font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent">
        {value}
        {suffix && <span className="ml-2 text-sm font-normal text-slate-400">{suffix}</span>}
      </span>
    </div>
  );
}

function InsightCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-base text-slate-500 font-medium">No items yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it, idx) => (
            <li key={idx} className="flex gap-3 items-center">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              <span className="text-base text-slate-200 font-medium">{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FrameworkPage() {
  const [input, setInput] = useState("");
  const [meta, setMeta] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FrameworkResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await fetch("/api/framework/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input, meta }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as FrameworkResult;
      setResult(json);
    } catch (e) {
      setError("Analysis failed. Check backend.");
      setResult({
        realityIndex: 7.8,
        trustProtocol: "PARTIAL",
        ethicalAlignment: 4.2,
        resonanceQuality: "ADVANCED",
        canvasParity: 68,
        strengths: ["Strong mission alignment and contextual coherence.", "High-quality synthesis across domains."],
        weaknesses: ["Boundary maintenance clarity.", "Limited stakeholder acknowledgement."],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)]">
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent mb-3">SYMBI Framework Detector</h2>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">Paste content to score across SYMBI dimensions.</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 block">Content to analyze</label>
            <textarea className="h-48 w-full resize-y rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-indigo-900/20 px-4 py-4 text-base text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950 backdrop-blur-sm transition-all duration-300" placeholder="Paste content here..." value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 block">Optional metadata</label>
            <textarea className="h-20 w-full resize-y rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 to-indigo-900/20 px-4 py-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:ring-offset-2 focus:ring-offset-slate-950 backdrop-blur-sm transition-all duration-300" placeholder="Model name, temperature, prompt, domain, etc." value={meta} onChange={(e) => setMeta(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <button onClick={analyze} disabled={loading || !input.trim()} className="inline-flex items-center rounded-3xl bg-gradient-to-r from-cyan-400 to-sky-300 px-6 py-3 text-base font-bold text-slate-950 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:from-cyan-300 hover:to-sky-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300 disabled:shadow-none transition-all duration-300">
              {loading ? "Analyzing…" : "Analyze Content"}
            </button>
            <p className="text-sm text-slate-400 font-medium">No content is stored by the UI.</p>
          </div>
          {error && <p className="text-sm text-rose-400 bg-gradient-to-r from-rose-500/20 to-red-500/20 border border-rose-500/40 rounded-2xl px-4 py-3 font-medium">{error}</p>}
        </div>
      </div>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/30 to-slate-900/60 p-6 backdrop-blur-sm shadow-xl shadow-indigo-500/10">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Five-dimension score</h3>
          {!result && <p className="text-base text-slate-400 font-medium">Run analysis to see scores.</p>}
          {result && (
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <ScorePill label="Reality Index" value={result.realityIndex.toFixed(1)} suffix="/ 10.0" />
              <ScorePill label="Trust Protocol" value={result.trustProtocol} variant="outline" />
              <ScorePill label="Ethical Alignment" value={result.ethicalAlignment.toFixed(1)} suffix="/ 5.0" />
              <ScorePill label="Resonance Quality" value={result.resonanceQuality} variant="gradient" />
              <ScorePill label="Canvas Parity" value={`${result.canvasParity.toFixed(0)}%`} />
            </div>
          )}
        </div>
        {result && (
          <div className="grid gap-6 md:grid-cols-2">
            <InsightCard title="Strengths" items={result.strengths} />
            <InsightCard title="Tuning opportunities" items={result.weaknesses} />
          </div>
        )}
      </div>
    </div>
  );
}