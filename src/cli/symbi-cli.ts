#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { merkleRoot, ed25519Verify, sha256Hex } from '../lib/audit/crypto-utils'
import * as kv from '../supabase/functions/server/kv_store'

async function exportAnchors() {
  const anchors = await kv.getByPrefix('ledger_anchor:')
  const extAnchors = await kv.getByPrefix('ledger_ext_anchor:')
  const out = { anchors, external: extAnchors }
  console.log(JSON.stringify(out, null, 2))
}

async function verifyTicket(filePath: string) {
  const ticket = JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf-8'))
  const shardHashes: string[] = ticket?.receipts?.sybi?.shard_hashes || []
  const providedRoot = (ticket.receipts?.merkle_root) || ((ticket.receipts?.merkle_proofs?.[0] || '').replace('merkle_root:', ''))
  const root = await merkleRoot(shardHashes)
  let proofOk = true
  const proofs = ticket.receipts?.merkle_proofs
  if (Array.isArray(proofs) && proofs.length > 0) {
    for (const p of proofs) {
      let acc = p.leaf
      for (let i = 0; i < p.siblings.length; i++) {
        const sib = p.siblings[i]
        const dir = p.flags?.[i] || 'L'
        acc = await sha256Hex(dir === 'L' ? acc + sib : sib + acc)
      }
      if (acc !== providedRoot) { proofOk = false; break }
    }
  }
  const rec = ticket.receipts.sybi
  const subjectCore = [rec.receipt_version, rec.tenant_id, rec.conversation_id, rec.output_id, rec.created_at, rec.model, rec.policy_pack, rec.shard_hashes.join(',')].join('|')
  const subjectHash = await sha256Hex(subjectCore)
  const subject = new TextEncoder().encode(subjectHash)
  const sigs = rec.signatures || {}
  const sigCtrlOk = await ed25519Verify(subject, (sigs.control_plane||'').split(':')[2]||'', (sigs.control_plane||'').split(':')[1]||'')
  const sigAgentOk = await ed25519Verify(subject, (sigs.agent||'').split(':')[2]||'', (sigs.agent||'').split(':')[1]||'')
  const merkleOk = root === providedRoot
  const valid = merkleOk && proofOk && (sigCtrlOk || sigAgentOk)
  console.log(JSON.stringify({ valid, checks: { merkleOk, proofOk, sigCtrlOk, sigAgentOk }, root }, null, 2))
}

async function main() {
  const [cmd, arg] = process.argv.slice(2)
  if (cmd === 'anchors:export') return exportAnchors()
  if (cmd === 'verify:ticket') {
    if (!arg) throw new Error('Path required')
    return verifyTicket(arg)
  }
  console.error('Usage: symbi-cli anchors:export | verify:ticket <path>')
  process.exit(1)
}

main().catch(e=>{ console.error(e); process.exit(1) })
