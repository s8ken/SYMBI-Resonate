import { b64ToUint8, uint8ToB64 } from '../base64'

test('base64 roundtrip', () => {
  const data = new Uint8Array([1,2,3,4,5,255])
  const b64 = uint8ToB64(data)
  const back = b64ToUint8(b64)
  expect(back).toHaveLength(data.length)
  for (let i=0;i<data.length;i++) expect(back[i]).toBe(data[i])
})

