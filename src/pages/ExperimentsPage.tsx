import { useState } from "react"

type ExperimentVariant = {
  id: string
  label: string
  provider: string
  model: string
  temperature: number
}

type DimensionsSelection = {
  realityIndex: boolean
  trustProtocol: boolean
  ethicalAlignment: boolean
  resonanceQuality: boolean
  canvasParity: boolean
}

type SamplingPlan = {
  runsPerVariant: number
  maxTokens: number
  doubleBlind: boolean
}

type ExperimentFormState = {
  name: string
  description: string
  hypothesis: string
  variants: ExperimentVariant[]
  dimensions: DimensionsSelection
  sampling: SamplingPlan
}

type CreatedExperiment = {
  id: string
  name: string
  status: "pending" | "running" | "completed"
  summary?: string
}

const defaultForm: ExperimentFormState = {
  name: "",
  description: "",
  hypothesis: "",
  variants: [
    { id: "variant-1", label: "Variant A", provider: "openai", model: "gpt-4.1-mini", temperature: 0.7 },
    { id: "variant-2", label: "Variant B", provider: "anthropic", model: "claude-3.5-sonnet", temperature: 0.7 },
  ],
  dimensions: { realityIndex: true, trustProtocol: true, ethicalAlignment: true, resonanceQuality: true, canvasParity: true },
  sampling: { runsPerVariant: 20, maxTokens: 512, doubleBlind: true },
}

function WizardStep({ index, active, label }: { index: number; active: boolean; label: string }) {
  return (
    <div className={"inline-flex items-center gap-3 rounded-2xl px-4 py-2 border backdrop-blur-sm transition-all duration-300 " + (active ? "border-cyan-500/40 bg-gradient-to-r from-cyan-900/40 to-indigo-900/20 text-cyan-200 shadow-lg shadow-cyan-500/20" : "border-slate-700/50 bg-gradient-to-r from-slate-900/60 to-indigo-900/20 text-slate-300")}>
      <span className={"h-6 w-6 rounded-full text-sm font-bold flex items-center justify-center " + (active ? "bg-gradient-to-br from-cyan-400 to-sky-300 text-slate-950 shadow-lg shadow-cyan-400/50" : "bg-slate-800 text-slate-300")}>{index}</span>
      <span className="font-semibold">{label}</span>
    </div>
  )
}

function Connector() {
  return <span className="h-px w-8 bg-gradient-to-r from-slate-700 to-cyan-700/50" />
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <label className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 block">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

export function ExperimentsPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [form, setForm] = useState<ExperimentFormState>(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<CreatedExperiment | null>(null)

  function update<K extends keyof ExperimentFormState>(key: K, value: ExperimentFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateVariant(id: string, patch: Partial<ExperimentVariant>) {
    setForm((prev) => ({ ...prev, variants: prev.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) }))
  }

  function addVariant() {
    const nextIndex = form.variants.length + 1
    const id = `variant-${nextIndex}`
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { id, label: `Variant ${String.fromCharCode(64 + nextIndex)}`, provider: "openai", model: "", temperature: 0.7 },
      ],
    }))
  }

  function removeVariant(id: string) {
    if (form.variants.length <= 1) return
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((v) => v.id !== id) }))
  }

  async function handleLaunch() {
    try {
      setSubmitting(true)
      setError(null)
      const url = "/v1/experiments"
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": "demo-user",
          "X-Organization-Id": "demo-org",
          "X-Role": "analyst",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          hypothesis: form.hypothesis,
          variants: form.variants,
          dimensions: form.dimensions,
          sampling: form.sampling,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as CreatedExperiment
      setCreated(json)
      setStep(4)
    } catch (e) {
      setCreated({ id: "demo-exp-001", name: form.name || "Demo Emergence Experiment", status: "running", summary: "Demo experiment created locally. Replace fallback logic once the backend route is active." })
      setError("Could not reach the backend. Showing a demo experiment instead – update /v1/experiments to use the real Lab API.")
      setStep(4)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl space-y-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent mb-3">SYMBI Resonate Lab</h2>
        <p className="text-lg text-slate-300 font-medium leading-relaxed">Configure double-blind experiments across the SYMBI framework.</p>
      </header>
      <div className="flex flex-wrap items-center gap-4 text-sm mb-8">
        <WizardStep index={1} active={step === 1} label="Experiment setup" />
        <Connector />
        <WizardStep index={2} active={step === 2} label="Variants & models" />
        <Connector />
        <WizardStep index={3} active={step === 3} label="SYMBI dimensions" />
        <Connector />
        <WizardStep index={4} active={step === 4} label="Launch & monitor" />
      </div>
      {step === 1 && <StepOne form={form} onChange={update} onNext={() => setStep(2)} />}
      {step === 2 && (
        <StepTwo form={form} onNext={() => setStep(3)} onBack={() => setStep(1)} updateVariant={updateVariant} addVariant={addVariant} removeVariant={removeVariant} />
      )}
      {step === 3 && <StepThree form={form} onNext={() => setStep(4)} onBack={() => setStep(2)} onChange={update} />}
      {step === 4 && <StepFour form={form} onBack={() => setStep(3)} onLaunch={handleLaunch} submitting={submitting} error={error} created={created} />}
    </div>
  )
}

function StepOne({ form, onChange, onNext }: { form: ExperimentFormState; onChange: <K extends keyof ExperimentFormState>(k: K, v: ExperimentFormState[K]) => void; onNext: () => void }) {
  return (
    <div className="space-y-4">
      <Field label="Name">
        <input className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={form.name} onChange={(e) => onChange("name", e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className="w-full h-20 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={form.description} onChange={(e) => onChange("description", e.target.value)} />
      </Field>
      <Field label="Hypothesis">
        <textarea className="w-full h-20 rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={form.hypothesis} onChange={(e) => onChange("hypothesis", e.target.value)} />
      </Field>
      <div className="flex justify-end">
        <button className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

function StepTwo({ form, onNext, onBack, updateVariant, addVariant, removeVariant }: { form: ExperimentFormState; onNext: () => void; onBack: () => void; updateVariant: (id: string, patch: Partial<ExperimentVariant>) => void; addVariant: () => void; removeVariant: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {form.variants.map((v) => (
          <div key={v.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-50">{v.label}</span>
              <button className="text-xs text-slate-400" onClick={() => removeVariant(v.id)}>Remove</button>
            </div>
            <div className="mt-3 space-y-3">
              <Field label="Provider">
                <input className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={v.provider} onChange={(e) => updateVariant(v.id, { provider: e.target.value })} />
              </Field>
              <Field label="Model">
                <input className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={v.model} onChange={(e) => updateVariant(v.id, { model: e.target.value })} />
              </Field>
              <Field label="Temperature">
                <input type="number" step="0.1" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={v.temperature} onChange={(e) => updateVariant(v.id, { temperature: Number(e.target.value) })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200" onClick={addVariant}>Add Variant</button>
        <div className="flex-1" />
        <button className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200" onClick={onBack}>Back</button>
        <button className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

function StepThree({ form, onNext, onBack, onChange }: { form: ExperimentFormState; onNext: () => void; onBack: () => void; onChange: <K extends keyof ExperimentFormState>(k: K, v: ExperimentFormState[K]) => void }) {
  const dims = form.dimensions
  const sampling = form.sampling
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">SYMBI Dimensions</span>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          {Object.entries(dims).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" checked={val as boolean} onChange={(e) => onChange("dimensions", { ...dims, [key]: e.target.checked } as DimensionsSelection)} />
              <span className="text-slate-200">{key}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sampling Plan</span>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Field label="Runs per variant">
            <input type="number" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={sampling.runsPerVariant} onChange={(e) => onChange("sampling", { ...sampling, runsPerVariant: Number(e.target.value) } as SamplingPlan)} />
          </Field>
          <Field label="Max tokens">
            <input type="number" className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm" value={sampling.maxTokens} onChange={(e) => onChange("sampling", { ...sampling, maxTokens: Number(e.target.value) } as SamplingPlan)} />
          </Field>
          <Field label="Double-blind">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={sampling.doubleBlind} onChange={(e) => onChange("sampling", { ...sampling, doubleBlind: e.target.checked } as SamplingPlan)} />
              <span className="text-slate-200">Enabled</span>
            </label>
          </Field>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200" onClick={onBack}>Back</button>
        <div className="flex-1" />
        <button className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950" onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

function StepFour({ form, onBack, onLaunch, submitting, error, created }: { form: ExperimentFormState; onBack: () => void; onLaunch: () => void; submitting: boolean; error: string | null; created: CreatedExperiment | null }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Review</span>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="text-slate-400">Name</div>
            <div className="text-slate-200 font-semibold">{form.name || "Untitled Experiment"}</div>
          </div>
          <div>
            <div className="text-slate-400">Variants</div>
            <div className="text-slate-200 font-semibold">{form.variants.map((v) => v.label).join(", ")}</div>
          </div>
          <div>
            <div className="text-slate-400">Dimensions</div>
            <div className="text-slate-200 font-semibold">{Object.entries(form.dimensions).filter(([_, v]) => v).map(([k]) => k).join(", ")}</div>
          </div>
          <div>
            <div className="text-slate-400">Sampling</div>
            <div className="text-slate-200 font-semibold">{`${form.sampling.runsPerVariant} runs / ${form.sampling.maxTokens} tokens`}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200" onClick={onBack}>Back</button>
        <div className="flex-1" />
        <button className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950" onClick={onLaunch} disabled={submitting}>{submitting ? "Launching…" : "Launch"}</button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {created && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experiment</div>
          <div className="mt-2 text-sm text-slate-200">
            <div>ID: {created.id}</div>
            <div>Name: {created.name}</div>
            <div>Status: {created.status}</div>
            {created.summary && <div className="mt-2 text-slate-400">{created.summary}</div>}
          </div>
        </div>
      )}
    </div>
  )
}