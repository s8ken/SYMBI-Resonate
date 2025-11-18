import { b64ToUint8, uint8ToB64 } from './base64'

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder()
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(input))
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  const nodeCrypto = await import('node:crypto')
  return nodeCrypto.createHash('sha256').update(input).digest('hex')
}

export type SignatureResult = { alg: 'Ed25519', kid: string, sig_base64: string } | { alg: 'none', kid?: string, sig_base64?: string }

export async function ed25519Sign(payload: Uint8Array): Promise<SignatureResult> {
  const { config } = await import('../../config/env')
  if (!config.ED25519_PRIVATE_KEY_BASE64 || !config.ED25519_PUBLIC_KEY_BASE64) {
    return { alg: 'none' }
  }
  const priv = Uint8Array.from(atob(config.ED25519_PRIVATE_KEY_BASE64), c => c.charCodeAt(0))
  const pub = Uint8Array.from(atob(config.ED25519_PUBLIC_KEY_BASE64), c => c.charCodeAt(0))
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const key = await crypto.subtle.importKey('pkcs8', priv, { name: 'Ed25519' }, false, ['sign'])
    const sig = await crypto.subtle.sign('Ed25519', key, payload)
    return { alg: 'Ed25519', kid: await sha256Hex(Buffer.from(pub).toString('hex')), sig_base64: btoa(String.fromCharCode(...new Uint8Array(sig))) }
  }
  const nacl = await import('tweetnacl')
  const sig = nacl.sign.detached(payload, priv)
  return { alg: 'Ed25519', kid: await sha256Hex(Array.from(pub).map(b=>b.toString(16).padStart(2,'0')).join('')), sig_base64: uint8ToB64(sig) }
}

export async function merkleRoot(leavesHex: string[]): Promise<string> {
  if (leavesHex.length === 0) return ''
  let level = leavesHex.slice()
  while (level.length > 1) {
    const next: string[] = []
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i]
      const right = level[i + 1] ?? left
      next.push(await sha256Hex(left + right))
    }
    level = next
  }
  return level[0]
}

export async function ed25519Verify(payload: Uint8Array, sigB64: string, kid: string): Promise<boolean> {
  const { config } = await import('../../config/env')
  let pub: Uint8Array | undefined
  if (config.ED25519_KEYS_JSON) {
    try {
      const map = JSON.parse(config.ED25519_KEYS_JSON) as Record<string,string>
      const b64 = map[kid]
      if (b64) pub = b64ToUint8(b64)
    } catch {}
  }
  if (!pub && config.ED25519_PUBLIC_KEY_BASE64) pub = b64ToUint8(config.ED25519_PUBLIC_KEY_BASE64)
  if (!pub) return false
  const sig = b64ToUint8(sigB64)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const key = await crypto.subtle.importKey('raw', pub, { name: 'Ed25519' }, false, ['verify'])
      const ok = await crypto.subtle.verify('Ed25519', key, sig, payload)
      return ok
    } catch {}
  }
  const nacl = await import('tweetnacl')
  return nacl.sign.detached.verify(payload, sig, pub)
}
