import { ed25519Verify } from '../crypto-utils'

test('kid mismatch rejects verification', async () => {
  process.env.ED25519_KEYS_JSON = JSON.stringify({ kidA: 'cHVibGljS2V5' })
  const ok = await ed25519Verify(new Uint8Array([1,2,3]), 'c2ln', 'kidB')
  expect(ok).toBe(false)
})

