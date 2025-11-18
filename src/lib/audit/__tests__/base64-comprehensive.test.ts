/**
 * Comprehensive base64 encoding/decoding edge case tests
 */

import { b64ToUint8, uint8ToB64 } from '../base64'

describe('Base64 Encoding/Decoding', () => {
  describe('Basic Roundtrip', () => {
    test('should roundtrip basic data', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 255])
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toHaveLength(data.length)
      for (let i = 0; i < data.length; i++) {
        expect(back[i]).toBe(data[i])
      }
    })

    test('should roundtrip empty array', () => {
      const data = new Uint8Array([])
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toHaveLength(0)
    })

    test('should roundtrip single byte', () => {
      const data = new Uint8Array([42])
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toHaveLength(1)
      expect(back[0]).toBe(42)
    })

    test('should roundtrip all byte values (0-255)', () => {
      const data = new Uint8Array(256)
      for (let i = 0; i < 256; i++) {
        data[i] = i
      }
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toHaveLength(256)
      for (let i = 0; i < 256; i++) {
        expect(back[i]).toBe(i)
      }
    })
  })

  describe('Edge Cases', () => {
    test('should handle zero bytes', () => {
      const data = new Uint8Array([0, 0, 0, 0])
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })

    test('should handle max byte value (255)', () => {
      const data = new Uint8Array([255, 255, 255, 255])
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })

    test('should handle mixed values', () => {
      const data = new Uint8Array([0, 127, 128, 255])
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })

    test('should handle length not divisible by 3 (padding case 1)', () => {
      const data = new Uint8Array([1, 2, 3, 4]) // Length 4 (4 % 3 = 1)
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })

    test('should handle length not divisible by 3 (padding case 2)', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]) // Length 5 (5 % 3 = 2)
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })

    test('should handle length divisible by 3 (no padding)', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6]) // Length 6 (6 % 3 = 0)
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })
  })

  describe('Large Data', () => {
    test('should handle 1KB of data', () => {
      const data = new Uint8Array(1024)
      for (let i = 0; i < 1024; i++) {
        data[i] = i % 256
      }
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })

    test('should handle 10KB of data', () => {
      const data = new Uint8Array(10240)
      for (let i = 0; i < 10240; i++) {
        data[i] = i % 256
      }
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })

    test('should handle random data', () => {
      const data = new Uint8Array(1000)
      for (let i = 0; i < 1000; i++) {
        data[i] = Math.floor(Math.random() * 256)
      }
      const b64 = uint8ToB64(data)
      const back = b64ToUint8(b64)
      expect(back).toEqual(data)
    })
  })

  describe('Binary Data Patterns', () => {
    test('should handle Ed25519 signature (64 bytes)', () => {
      // Simulate Ed25519 signature
      const signature = new Uint8Array(64)
      for (let i = 0; i < 64; i++) {
        signature[i] = (i * 7) % 256
      }
      const b64 = uint8ToB64(signature)
      const back = b64ToUint8(b64)
      expect(back).toEqual(signature)
    })

    test('should handle Ed25519 public key (32 bytes)', () => {
      // Simulate Ed25519 public key
      const pubkey = new Uint8Array(32)
      for (let i = 0; i < 32; i++) {
        pubkey[i] = (i * 13) % 256
      }
      const b64 = uint8ToB64(pubkey)
      const back = b64ToUint8(b64)
      expect(back).toEqual(pubkey)
    })

    test('should handle SHA-256 hash (32 bytes)', () => {
      const hash = new Uint8Array([
        0xa3, 0xb5, 0xc7, 0xd9, 0xe1, 0xf2, 0xa4, 0xb6,
        0xc8, 0xd0, 0xe2, 0xf4, 0xa6, 0xb8, 0xc0, 0xd2,
        0xe4, 0xf6, 0xa8, 0xba, 0xcc, 0xde, 0xf0, 0xa2,
        0xb4, 0xc6, 0xd8, 0xea, 0xfc, 0xae, 0xb0, 0xc2
      ])
      const b64 = uint8ToB64(hash)
      const back = b64ToUint8(b64)
      expect(back).toEqual(hash)
    })
  })

  describe('Encoding Format Validation', () => {
    test('should produce valid base64 characters', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const b64 = uint8ToB64(data)
      // Base64 should only contain A-Z, a-z, 0-9, +, /, =
      expect(b64).toMatch(/^[A-Za-z0-9+/=]*$/)
    })

    test('should produce correct padding', () => {
      // Length 1 should have 2 padding chars
      const data1 = new Uint8Array([1])
      const b64_1 = uint8ToB64(data1)
      expect(b64_1.endsWith('==')).toBe(true)

      // Length 2 should have 1 padding char
      const data2 = new Uint8Array([1, 2])
      const b64_2 = uint8ToB64(data2)
      expect(b64_2.endsWith('=') && !b64_2.endsWith('==')).toBe(true)

      // Length 3 should have no padding
      const data3 = new Uint8Array([1, 2, 3])
      const b64_3 = uint8ToB64(data3)
      expect(b64_3.endsWith('=')).toBe(false)
    })

    test('should handle standard base64 encoding', () => {
      // Known test vectors from RFC 4648
      const testVectors = [
        { input: new Uint8Array([0x14, 0xfb, 0x9c, 0x03, 0xd9, 0x7e]), expected: 'FPucA9l+' },
        { input: new Uint8Array([0x14, 0xfb, 0x9c, 0x03, 0xd9]), expected: 'FPucA9k=' },
        { input: new Uint8Array([0x14, 0xfb, 0x9c, 0x03]), expected: 'FPucAw==' },
      ]

      for (const { input, expected } of testVectors) {
        const b64 = uint8ToB64(input)
        expect(b64).toBe(expected)
      }
    })
  })

  describe('Decoding Validation', () => {
    test('should decode standard base64 strings', () => {
      const testVectors = [
        { b64: 'SGVsbG8=', expected: new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]) }, // "Hello"
        { b64: 'V29ybGQ=', expected: new Uint8Array([0x57, 0x6f, 0x72, 0x6c, 0x64]) }, // "World"
      ]

      for (const { b64, expected } of testVectors) {
        const decoded = b64ToUint8(b64)
        expect(decoded).toEqual(expected)
      }
    })

    test('should handle base64 without padding', () => {
      // Some base64 implementations omit padding
      const withPadding = 'SGVsbG8='
      const withoutPadding = 'SGVsbG8'
      
      const result1 = b64ToUint8(withPadding)
      const result2 = b64ToUint8(withoutPadding)
      
      // Both should decode to same value
      expect(result1).toEqual(result2)
    })
  })

  describe('Determinism', () => {
    test('should produce same encoding for same input', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5])
      const b64_1 = uint8ToB64(data)
      const b64_2 = uint8ToB64(data)
      const b64_3 = uint8ToB64(data)
      
      expect(b64_1).toBe(b64_2)
      expect(b64_2).toBe(b64_3)
    })

    test('should produce different encodings for different inputs', () => {
      const data1 = new Uint8Array([1, 2, 3, 4, 5])
      const data2 = new Uint8Array([1, 2, 3, 4, 6])
      
      const b64_1 = uint8ToB64(data1)
      const b64_2 = uint8ToB64(data2)
      
      expect(b64_1).not.toBe(b64_2)
    })
  })

  describe('Cross-Runtime Compatibility', () => {
    test('should match native atob/btoa behavior', () => {
      const testString = 'Hello, World!'
      const bytes = new Uint8Array(testString.split('').map(c => c.charCodeAt(0)))
      
      // Our implementation
      const ourB64 = uint8ToB64(bytes)
      
      // Native btoa
      const nativeB64 = btoa(testString)
      
      expect(ourB64).toBe(nativeB64)
    })

    test('should decode what native atob encodes', () => {
      const testString = 'Test Data 123'
      const nativeB64 = btoa(testString)
      
      const decoded = b64ToUint8(nativeB64)
      const decodedString = String.fromCharCode(...decoded)
      
      expect(decodedString).toBe(testString)
    })
  })
})
