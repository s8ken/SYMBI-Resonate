import { ed25519Verify } from '../crypto-utils'

test('ed25519Verify returns false when no keys configured', async () => {
  const ok = await ed25519Verify(new Uint8Array([0,1,2]), 'ZmFrZVNpZw==', 'kid1')
  expect(ok).toBe(false)
})

