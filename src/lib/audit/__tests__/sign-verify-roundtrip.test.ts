import { ed25519Sign, ed25519Verify, sha256Hex } from '../crypto-utils'

function toB64(u: Uint8Array): string {
  return Buffer.from(u).toString('base64')
}

test('WebCrypto/tweetnacl sign/verify round-trip succeeds', async () => {
  const nacl = await import('tweetnacl')
  const kp = nacl.sign.keyPair()
  process.env.VITE_TENANT_ID = 't1'
  process.env.VITE_MODEL_ID = 'm1'
  process.env.VITE_POLICY_PACK = 'p1'
  process.env.VITE_SUPABASE_URL = 'http://localhost'
  process.env.VITE_SUPABASE_ANON_KEY = 'anon'
  process.env.VITE_ED25519_PRIVATE_KEY_BASE64 = toB64(kp.secretKey)
  process.env.VITE_ED25519_PUBLIC_KEY_BASE64 = toB64(kp.publicKey)

  const payload = new TextEncoder().encode(await sha256Hex('subject'))
  const sig = await ed25519Sign(payload)
  expect(sig.alg).toBe('Ed25519')
  const ok = await ed25519Verify(payload, sig.sig_base64, sig.kid)
  expect(ok).toBe(true)
})

test('mismatched kid rejects verification', async () => {
  const nacl = await import('tweetnacl')
  const kp = nacl.sign.keyPair()
  process.env.VITE_ED25519_PRIVATE_KEY_BASE64 = toB64(kp.secretKey)
  process.env.VITE_ED25519_PUBLIC_KEY_BASE64 = toB64(kp.publicKey)
  process.env.VITE_ED25519_KEYS_JSON = JSON.stringify({})
  const payload = new Uint8Array([1,2,3])
  const sig = await ed25519Sign(payload)
  const ok = await ed25519Verify(payload, sig.sig_base64, 'wrong-kid')
  expect(ok).toBe(false)
})
