/**
 * Tests for JWT authentication and security middleware
 */

import { verifyJWT, type JWTPayload, type Role } from '../security'

describe('JWT Authentication', () => {
  const TEST_SECRET = 'test-secret-key-for-jwt-signing-minimum-32-chars'

  /**
   * Helper function to create a test JWT token
   * In production, this would be done by an auth service
   */
  async function createTestJWT(payload: Partial<JWTPayload>, secret: string): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' }
    const headerB64 = base64UrlEncode(JSON.stringify(header))
    
    const now = Math.floor(Date.now() / 1000)
    const fullPayload: JWTPayload = {
      sub: payload.sub || 'test-user-id',
      tenant_id: payload.tenant_id || 'test-tenant',
      role: payload.role || 'analyst',
      iat: payload.iat || now,
      exp: payload.exp || (now + 3600), // 1 hour from now
    }
    const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload))

    // Sign with HMAC-SHA256
    const encoder = new TextEncoder()
    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', secretKey, data)
    const signatureB64 = base64UrlEncode(signature)

    return `${headerB64}.${payloadB64}.${signatureB64}`
  }

  function base64UrlEncode(input: string | ArrayBuffer): string {
    const bytes = typeof input === 'string' 
      ? new TextEncoder().encode(input)
      : new Uint8Array(input)
    
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  describe('verifyJWT', () => {
    test('should verify valid JWT token', async () => {
      const token = await createTestJWT({
        sub: 'user123',
        tenant_id: 'tenant456',
        role: 'admin',
      }, TEST_SECRET)

      const payload = await verifyJWT(token, TEST_SECRET)
      
      expect(payload).not.toBeNull()
      expect(payload?.sub).toBe('user123')
      expect(payload?.tenant_id).toBe('tenant456')
      expect(payload?.role).toBe('admin')
    })

    test('should reject JWT with invalid signature', async () => {
      const token = await createTestJWT({
        sub: 'user123',
        tenant_id: 'tenant456',
        role: 'admin',
      }, TEST_SECRET)

      // Tamper with the token
      const parts = token.split('.')
      const tamperedToken = `${parts[0]}.${parts[1]}.invalidsignature`

      const payload = await verifyJWT(tamperedToken, TEST_SECRET)
      expect(payload).toBeNull()
    })

    test('should reject JWT with wrong secret', async () => {
      const token = await createTestJWT({
        sub: 'user123',
        tenant_id: 'tenant456',
        role: 'admin',
      }, TEST_SECRET)

      const payload = await verifyJWT(token, 'wrong-secret-key')
      expect(payload).toBeNull()
    })

    test('should reject expired JWT token', async () => {
      const now = Math.floor(Date.now() / 1000)
      const token = await createTestJWT({
        sub: 'user123',
        tenant_id: 'tenant456',
        role: 'admin',
        iat: now - 7200,
        exp: now - 3600, // Expired 1 hour ago
      }, TEST_SECRET)

      const payload = await verifyJWT(token, TEST_SECRET)
      expect(payload).toBeNull()
    })

    test('should reject JWT with malformed format', async () => {
      const payload = await verifyJWT('not.a.valid.jwt.token', TEST_SECRET)
      expect(payload).toBeNull()
    })

    test('should reject JWT with missing required fields', async () => {
      const header = { alg: 'HS256', typ: 'JWT' }
      const headerB64 = base64UrlEncode(JSON.stringify(header))
      
      const incompletePayload = { sub: 'user123' } // Missing tenant_id and role
      const payloadB64 = base64UrlEncode(JSON.stringify(incompletePayload))

      const encoder = new TextEncoder()
      const data = encoder.encode(`${headerB64}.${payloadB64}`)
      const secretKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(TEST_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signature = await crypto.subtle.sign('HMAC', secretKey, data)
      const signatureB64 = base64UrlEncode(signature)

      const token = `${headerB64}.${payloadB64}.${signatureB64}`
      const payload = await verifyJWT(token, TEST_SECRET)
      expect(payload).toBeNull()
    })

    test('should reject JWT with invalid role', async () => {
      const header = { alg: 'HS256', typ: 'JWT' }
      const headerB64 = base64UrlEncode(JSON.stringify(header))
      
      const now = Math.floor(Date.now() / 1000)
      const invalidPayload = {
        sub: 'user123',
        tenant_id: 'tenant456',
        role: 'invalid-role', // Not a valid role
        iat: now,
        exp: now + 3600,
      }
      const payloadB64 = base64UrlEncode(JSON.stringify(invalidPayload))

      const encoder = new TextEncoder()
      const data = encoder.encode(`${headerB64}.${payloadB64}`)
      const secretKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(TEST_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const signature = await crypto.subtle.sign('HMAC', secretKey, data)
      const signatureB64 = base64UrlEncode(signature)

      const token = `${headerB64}.${payloadB64}.${signatureB64}`
      const payload = await verifyJWT(token, TEST_SECRET)
      expect(payload).toBeNull()
    })

    test('should verify JWT with all valid roles', async () => {
      const roles: Role[] = ['admin', 'auditor', 'analyst', 'read-only']
      
      for (const role of roles) {
        const token = await createTestJWT({
          sub: 'user123',
          tenant_id: 'tenant456',
          role,
        }, TEST_SECRET)

        const payload = await verifyJWT(token, TEST_SECRET)
        expect(payload).not.toBeNull()
        expect(payload?.role).toBe(role)
      }
    })

    test('should handle JWT with special characters in payload', async () => {
      const token = await createTestJWT({
        sub: 'user-with-special@chars.com',
        tenant_id: 'tenant_456-abc',
        role: 'admin',
      }, TEST_SECRET)

      const payload = await verifyJWT(token, TEST_SECRET)
      expect(payload).not.toBeNull()
      expect(payload?.sub).toBe('user-with-special@chars.com')
      expect(payload?.tenant_id).toBe('tenant_456-abc')
    })
  })
})
