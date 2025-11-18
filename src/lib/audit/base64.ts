export function b64ToUint8(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64)
    const out = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
    return out
  }
  const mod = require('node:buffer')
  return new Uint8Array(mod.Buffer.from(b64, 'base64'))
}

export function uint8ToB64(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    let s = ''
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
    return btoa(s)
  }
  const mod = require('node:buffer')
  return mod.Buffer.from(bytes).toString('base64')
}

