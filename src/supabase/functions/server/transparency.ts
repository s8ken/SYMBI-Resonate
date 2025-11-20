import { sha256Hex } from '../../../lib/audit/crypto-utils'

type Entry = {
  idx: number
  ts: string
  who: string
  what: string
  subject_hash: string
  prev_hash: string
  entry_hash: string
  date: string
}

async function kvGet(key: string): Promise<any> {
  const k = await import('./kv_store.tsx')
  // @ts-ignore
  return k.get(key)
}
async function kvSet(key: string, value: any, opts?: any): Promise<void> {
  const k = await import('./kv_store.tsx')
  // @ts-ignore
  return k.set(key, value, opts)
}

export async function appendTransparency(who: string, what: string, subject_hash: string): Promise<Entry> {
  const now = new Date()
  const date = now.toISOString().slice(0,10)
  const headKey = `transparency:head:${date}`
  const seqKey = `transparency:seq:${date}`
  const seqRaw = await kvGet(seqKey)
  const idx = (seqRaw?.idx as number) || 0
  const prevHead = (await kvGet(headKey))?.entry_hash || ''
  const core = JSON.stringify({ idx, ts: now.toISOString(), who, what, subject_hash, prev_hash: prevHead, date })
  const entry_hash = await sha256Hex(core)
  const entry: Entry = { idx, ts: now.toISOString(), who, what, subject_hash, prev_hash: prevHead, entry_hash, date }
  await kvSet(`transparency:log:${date}:${idx}`, entry)
  await kvSet(headKey, entry)
  await kvSet(seqKey, { idx: idx + 1 })
  await kvSet(`transparency:root:${date}`, entry_hash)
  return entry
}

export async function exportTransparency(date: string): Promise<{ date: string, root: string, entries: Entry[], valid: boolean }> {
  const seq = (await kvGet(`transparency:seq:${date}`))?.idx as number || 0
  const entries: Entry[] = []
  for (let i = 0; i < seq; i++) {
    const e = await kvGet(`transparency:log:${date}:${i}`)
    if (e) entries.push(e as Entry)
  }
  const root = (await kvGet(`transparency:root:${date}`))?.toString() || ''
  const valid = await verifyChain(entries, root)
  return { date, root, entries, valid }
}

export async function headTransparency(): Promise<{ date: string, head?: Entry }> {
  const date = new Date().toISOString().slice(0,10)
  const head = await kvGet(`transparency:head:${date}`)
  return { date, head: head as Entry | undefined }
}

export async function verifyChain(entries: Entry[], root: string): Promise<boolean> {
  let prev = ''
  for (const e of entries) {
    const core = JSON.stringify({ idx: e.idx, ts: e.ts, who: e.who, what: e.what, subject_hash: e.subject_hash, prev_hash: prev, date: e.date })
    const h = await sha256Hex(core)
    if (h !== e.entry_hash) return false
    prev = e.entry_hash
  }
  return entries.length === 0 ? root === '' : prev === root
}
