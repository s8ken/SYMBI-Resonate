import { useState } from "react"
import { EmergenceDashboard } from "../components/pages/EmergenceDashboard"
import { FrameworkPage } from "../components/pages/FrameworkPage"
import { ExperimentsPage } from "../pages/ExperimentsPage"

type PageId = "overview" | "emergence" | "framework" | "experiments" | "cases"

function classNames(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function pageTitle(page: PageId): string {
  switch (page) {
    case "overview":
      return "Emergence Overview"
    case "emergence":
      return "Emergence & Drift Monitor"
    case "framework":
      return "SYMBI Framework Detection"
    case "experiments":
      return "SYMBI Resonate Lab"
    case "cases":
      return "Case Studies & Pilots"
  }
}

function pageSubtitle(page: PageId): string {
  switch (page) {
    case "overview":
      return "Reality index, drift state, and criticality at a glance."
    case "emergence":
      return "Time-series view of drift, emergence score, and alert levels."
    case "framework":
      return "5D SYMBI framework scoring for any content or model output."
    case "experiments":
      return "Double-blind multi-agent experiments across models and prompts."
    case "cases":
      return "Published narratives and receipts from real-world runs."
  }
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent mb-3">{title}</h2>
        <p className="text-lg text-slate-300 font-medium leading-relaxed">{description}</p>
      </div>
      
      <div className="grid gap-6">
        <div className="rounded-3xl border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-indigo-900/40 to-slate-900/60 p-8 backdrop-blur-sm shadow-2xl shadow-indigo-500/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-300 to-indigo-500 text-xl font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
              SY
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">SYMBI Framework Ready</h3>
              <p className="text-slate-400">Enhanced interface components loaded</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/40 to-indigo-900/20 p-4 backdrop-blur-sm">
              <div className="text-cyan-300 font-semibold mb-2">Reality Index</div>
              <div className="text-2xl font-bold text-slate-100">8.7</div>
              <div className="text-xs text-slate-400 mt-1">Advanced Detection</div>
            </div>
            
            <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/20 p-4 backdrop-blur-sm">
              <div className="text-indigo-300 font-semibold mb-2">Trust Protocol</div>
              <div className="text-2xl font-bold text-slate-100">FULL</div>
              <div className="text-xs text-slate-400 mt-1">Complete Alignment</div>
            </div>
            
            <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-4 backdrop-blur-sm">
              <div className="text-slate-300 font-semibold mb-2">Canvas Parity</div>
              <div className="text-2xl font-bold text-slate-100">94%</div>
              <div className="text-xs text-slate-400 mt-1">High Fidelity</div>
            </div>
          </div>
        </div>
        
        <div className="rounded-3xl border border-slate-800/30 bg-gradient-to-r from-slate-900/40 via-indigo-900/20 to-slate-900/40 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
            <div className="text-sm text-slate-300">Interface enhancements active</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResonateConsole() {
  const [page, setPage] = useState<PageId>("overview")
  const navItems: { id: PageId; label: string; badge?: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "emergence", label: "Emergence Monitor" },
    { id: "framework", label: "SYMBI Framework" },
    { id: "experiments", label: "Resonate Lab" },
    { id: "cases", label: "Case Studies" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50 flex">
      <aside className="hidden md:flex md:flex-col w-72 border-r border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60 bg-gradient-to-r from-slate-950 to-indigo-950/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-300 to-indigo-500 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20">R</div>
          <div className="leading-tight">
            <div className="text-base font-bold tracking-wide bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">SYMBI Resonate</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Emergence Lab</div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setPage(item.id)} 
              className={classNames(
                "w-full flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-300 font-medium",
                page === item.id 
                  ? "bg-gradient-to-r from-slate-900/90 to-indigo-900/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.25)] backdrop-blur-sm" 
                  : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-900/60 hover:to-indigo-900/30 hover:text-cyan-200 border border-transparent hover:border-cyan-500/20"
              )}
            > 
              <span className="flex items-center gap-3">
                <span className={classNames(
                  "w-2 h-2 rounded-full",
                  page === item.id ? "bg-cyan-400 shadow-lg shadow-cyan-400/50" : "bg-slate-600"
                )} />
                {item.label}
              </span>
              {item.badge && <span className="rounded-full bg-gradient-to-r from-slate-800 to-indigo-800 px-2 py-1 text-[10px] text-slate-300 border border-slate-700">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-800/60 px-5 py-5 text-[11px] text-slate-400 space-y-3 bg-gradient-to-t from-slate-950 to-transparent">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Environment</span>
            <span className="rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-3 py-1 text-[10px] text-emerald-300 border border-emerald-500/30 font-medium">Lab</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Backend</span>
            <span className="text-cyan-300 font-medium">Express + Supabase</span>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-800/50 bg-gradient-to-r from-slate-950/90 via-indigo-950/40 to-slate-950/90 backdrop-blur-xl px-6 py-4">
          <div className="md:hidden flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-300 to-indigo-500 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/20">R</div>
            <div>
              <div className="text-base font-bold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">SYMBI Resonate</div>
              <div className="text-xs text-slate-400 font-medium">{pageSubtitle(page)}</div>
            </div>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-100 to-cyan-300 bg-clip-text text-transparent">{pageTitle(page)}</h1>
            <p className="text-sm text-slate-400 font-medium mt-1">{pageSubtitle(page)}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 px-4 py-2 text-sm text-emerald-300 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              API: healthy
            </span>
            <a href="https://github.com/s8ken/SYMBI-Resonate" target="_blank" rel="noreferrer" className="rounded-2xl border border-slate-700/50 bg-gradient-to-r from-slate-900/60 to-indigo-900/40 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-cyan-400/50 hover:text-cyan-200 transition-all duration-300 backdrop-blur-sm">View repo</a>
          </div>
        </header>
        <main className="flex-1 px-6 py-8 bg-gradient-to-br from-slate-950 via-slate-900/80 to-indigo-950/60">
          <div className="max-w-7xl mx-auto">
            {page === "overview" && <EmergenceDashboard />}
            {page === "emergence" && <EmergenceDashboard />}
            {page === "framework" && <FrameworkPage />}
            {page === "experiments" && <ExperimentsPage />}
            {page === "cases" && <PlaceholderPage title="Case Studies" description="Curated observational runs and pilots." />}
          </div>
        </main>
      </div>
    </div>
  )
}