/**
 * Comprehensive tests for merkle proof verification
 * Tests positive and negative cases for tamper detection
 */

import { merkleRoot, sha256Hex } from '../crypto-utils'

describe('Merkle Tree Utilities', () => {
  describe('merkleRoot', () => {
    test('should return empty string for empty array', async () => {
      const root = await merkleRoot([])
      expect(root).toBe('')
    })

    test('should return single hash for array with one element', async () => {
      const leaf = 'a1b2c3d4'
      const root = await merkleRoot([leaf])
      expect(root).toBe(leaf)
    })

    test('should compute correct root for two leaves', async () => {
      const leaves = ['leaf1', 'leaf2']
      const root = await merkleRoot(leaves)
      
      // Expected: sha256(leaf1 + leaf2)
      const expected = await sha256Hex('leaf1leaf2')
      expect(root).toBe(expected)
    })

    test('should compute correct root for three leaves (odd number)', async () => {
      const leaves = ['leaf1', 'leaf2', 'leaf3']
      const root = await merkleRoot(leaves)
      
      // Level 1: [sha256(leaf1+leaf2), sha256(leaf3+leaf3)]
      const h1 = await sha256Hex('leaf1leaf2')
      const h2 = await sha256Hex('leaf3leaf3')
      
      // Root: sha256(h1+h2)
      const expected = await sha256Hex(h1 + h2)
      expect(root).toBe(expected)
    })

    test('should compute correct root for four leaves', async () => {
      const leaves = ['a', 'b', 'c', 'd']
      const root = await merkleRoot(leaves)
      
      // Level 1: [sha256(a+b), sha256(c+d)]
      const h1 = await sha256Hex('ab')
      const h2 = await sha256Hex('cd')
      
      // Root: sha256(h1+h2)
      const expected = await sha256Hex(h1 + h2)
      expect(root).toBe(expected)
    })

    test('should compute correct root for eight leaves', async () => {
      const leaves = ['1', '2', '3', '4', '5', '6', '7', '8']
      const root = await merkleRoot(leaves)
      
      // Verify structure
      expect(root).toMatch(/^[0-9a-f]{64}$/)
      
      // Verify determinism - same input should produce same root
      const root2 = await merkleRoot(leaves)
      expect(root).toBe(root2)
    })

    test('should be deterministic for same input', async () => {
      const leaves = ['hash1', 'hash2', 'hash3', 'hash4']
      const root1 = await merkleRoot(leaves)
      const root2 = await merkleRoot(leaves)
      const root3 = await merkleRoot(leaves)
      
      expect(root1).toBe(root2)
      expect(root2).toBe(root3)
    })

    test('should produce different roots for different inputs', async () => {
      const leaves1 = ['a', 'b', 'c', 'd']
      const leaves2 = ['a', 'b', 'c', 'e'] // Last leaf different
      
      const root1 = await merkleRoot(leaves1)
      const root2 = await merkleRoot(leaves2)
      
      expect(root1).not.toBe(root2)
    })

    test('should be sensitive to leaf order', async () => {
      const leaves1 = ['a', 'b', 'c', 'd']
      const leaves2 = ['b', 'a', 'c', 'd'] // Swapped first two
      
      const root1 = await merkleRoot(leaves1)
      const root2 = await merkleRoot(leaves2)
      
      expect(root1).not.toBe(root2)
    })

    test('should handle large number of leaves', async () => {
      const leaves = Array.from({ length: 1000 }, (_, i) => `leaf${i}`)
      const root = await merkleRoot(leaves)
      
      expect(root).toMatch(/^[0-9a-f]{64}$/)
      
      // Verify determinism even with large input
      const root2 = await merkleRoot(leaves)
      expect(root).toBe(root2)
    })

    test('should handle leaves with special characters', async () => {
      const leaves = [
        'leaf with spaces',
        'leaf-with-dashes',
        'leaf_with_underscores',
        'leaf.with.dots',
        'leaf@with@symbols'
      ]
      const root = await merkleRoot(leaves)
      
      expect(root).toMatch(/^[0-9a-f]{64}$/)
    })
  })

  describe('Merkle Proof Verification (Negative Cases)', () => {
    test('should detect tampered leaf', async () => {
      // Original leaves
      const leaves = ['a', 'b', 'c', 'd']
      const originalRoot = await merkleRoot(leaves)
      
      // Tamper with one leaf
      const tamperedLeaves = ['a', 'TAMPERED', 'c', 'd']
      const tamperedRoot = await merkleRoot(tamperedLeaves)
      
      // Roots should differ (tamper detected)
      expect(tamperedRoot).not.toBe(originalRoot)
    })

    test('should detect added leaf', async () => {
      const leaves = ['a', 'b', 'c', 'd']
      const originalRoot = await merkleRoot(leaves)
      
      // Add extra leaf
      const modifiedLeaves = ['a', 'b', 'c', 'd', 'e']
      const modifiedRoot = await merkleRoot(modifiedLeaves)
      
      expect(modifiedRoot).not.toBe(originalRoot)
    })

    test('should detect removed leaf', async () => {
      const leaves = ['a', 'b', 'c', 'd']
      const originalRoot = await merkleRoot(leaves)
      
      // Remove leaf
      const modifiedLeaves = ['a', 'b', 'c']
      const modifiedRoot = await merkleRoot(modifiedLeaves)
      
      expect(modifiedRoot).not.toBe(originalRoot)
    })

    test('should detect reordered leaves', async () => {
      const leaves = ['a', 'b', 'c', 'd']
      const originalRoot = await merkleRoot(leaves)
      
      // Reverse order
      const reorderedLeaves = ['d', 'c', 'b', 'a']
      const reorderedRoot = await merkleRoot(reorderedLeaves)
      
      expect(reorderedRoot).not.toBe(originalRoot)
    })

    test('should verify proof path for valid leaf', async () => {
      // Simulate proof verification for leaf at index 0
      const leaves = ['a', 'b', 'c', 'd']
      const root = await merkleRoot(leaves)
      
      // Manual proof construction for 'a' at index 0
      // Level 0: a, b -> parent1 = sha256(a+b)
      const parent1 = await sha256Hex('ab')
      
      // Sibling at level 0 is sha256(c+d)
      const sibling1 = await sha256Hex('cd')
      
      // Root = sha256(parent1 + sibling1)
      const computedRoot = await sha256Hex(parent1 + sibling1)
      
      expect(computedRoot).toBe(root)
    })

    test('should reject proof with wrong sibling', async () => {
      const leaves = ['a', 'b', 'c', 'd']
      const root = await merkleRoot(leaves)
      
      // Try to verify 'a' with wrong sibling
      const parent1 = await sha256Hex('ab')
      const wrongSibling = await sha256Hex('xx') // Wrong sibling
      const wrongRoot = await sha256Hex(parent1 + wrongSibling)
      
      expect(wrongRoot).not.toBe(root)
    })

    test('should handle duplicate leaves correctly', async () => {
      const leaves = ['a', 'a', 'b', 'b']
      const root = await merkleRoot(leaves)
      
      // Different from non-duplicate case
      const differentLeaves = ['a', 'b', 'c', 'd']
      const differentRoot = await merkleRoot(differentLeaves)
      
      expect(root).not.toBe(differentRoot)
    })
  })

  describe('sha256Hex edge cases', () => {
    test('should hash empty string', async () => {
      const hash = await sha256Hex('')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
      expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    })

    test('should hash single character', async () => {
      const hash = await sha256Hex('a')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    test('should produce same hash for same input', async () => {
      const input = 'test input'
      const hash1 = await sha256Hex(input)
      const hash2 = await sha256Hex(input)
      expect(hash1).toBe(hash2)
    })

    test('should produce different hashes for different inputs', async () => {
      const hash1 = await sha256Hex('input1')
      const hash2 = await sha256Hex('input2')
      expect(hash1).not.toBe(hash2)
    })

    test('should handle long strings', async () => {
      const longString = 'a'.repeat(10000)
      const hash = await sha256Hex(longString)
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    test('should handle unicode characters', async () => {
      const hash = await sha256Hex('Hello 世界 🌍')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    test('should handle newlines and special characters', async () => {
      const input = 'line1\nline2\ttab\r\nwindows'
      const hash = await sha256Hex(input)
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })
  })

  describe('Merkle Tree Attack Scenarios', () => {
    test('should detect second preimage attack attempt', async () => {
      // Attacker tries to find different content with same hash
      const originalLeaves = ['original1', 'original2']
      const originalRoot = await merkleRoot(originalLeaves)
      
      // Different content
      const attackLeaves = ['attack1', 'attack2']
      const attackRoot = await merkleRoot(attackLeaves)
      
      // Should have different roots (second preimage resistance)
      expect(attackRoot).not.toBe(originalRoot)
    })

    test('should detect leaf substitution', async () => {
      const leaves = ['leaf1', 'leaf2', 'leaf3', 'leaf4']
      const root = await merkleRoot(leaves)
      
      // Attacker substitutes middle leaf
      const attackLeaves = ['leaf1', 'attacker_controlled', 'leaf3', 'leaf4']
      const attackRoot = await merkleRoot(attackLeaves)
      
      expect(attackRoot).not.toBe(root)
    })

    test('should detect tree truncation', async () => {
      const leaves = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
      const root = await merkleRoot(leaves)
      
      // Attacker truncates tree
      const truncated = ['a', 'b', 'c', 'd']
      const truncatedRoot = await merkleRoot(truncated)
      
      expect(truncatedRoot).not.toBe(root)
    })

    test('should maintain integrity with empty leaf value', async () => {
      const leaves = ['a', '', 'c', 'd']
      const root = await merkleRoot(leaves)
      
      // Different from non-empty case
      const nonEmpty = ['a', 'b', 'c', 'd']
      const nonEmptyRoot = await merkleRoot(nonEmpty)
      
      expect(root).not.toBe(nonEmptyRoot)
    })
  })
})
