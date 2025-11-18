import { sha256Hex } from '../crypto-utils'

test('sha256Hex computes stable digest', async () => {
  const h = await sha256Hex('abc')
  expect(h).toMatch(/^[0-9a-f]{64}$/)
})

