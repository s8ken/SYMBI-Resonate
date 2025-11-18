/**
 * Security middleware for JWT-based authentication and authorization
 */

export type Role = 'admin' | 'auditor' | 'analyst' | 'read-only'

export interface JWTPayload {
  sub: string // user ID
  tenant_id: string
  role: Role
  exp: number // expiration timestamp
  iat: number // issued at timestamp
}

/**
 * Verify JWT token and extract payload
 * Uses HMAC-SHA256 for signature verification
 */
export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerB64, payloadB64, signatureB64] = parts

    // Verify signature
    const encoder = new TextEncoder()
    const data = encoder.encode(`${headerB64}.${payloadB64}`)
    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signature = base64UrlDecode(signatureB64)
    const valid = await crypto.subtle.verify('HMAC', secretKey, signature, data)

    if (!valid) {
      return null
    }

    // Decode and parse payload
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64))
    const payload = JSON.parse(payloadJson) as JWTPayload

    // Check expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null
    }

    // Validate required fields
    if (!payload.sub || !payload.tenant_id || !payload.role) {
      return null
    }

    // Validate role
    const validRoles: Role[] = ['admin', 'auditor', 'analyst', 'read-only']
    if (!validRoles.includes(payload.role)) {
      return null
    }

    return payload
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Base64 URL decode (JWT standard)
 */
function base64UrlDecode(str: string): Uint8Array {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if needed
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  // Decode base64
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * JWT authentication middleware for Hono
 * Extracts and verifies JWT from Authorization header
 */
export function jwtAuth(secret?: string) {
  return async (c: any, next: () => Promise<void>) => {
    const jwtSecret = secret || Deno.env.get('JWT_SECRET')
    if (!jwtSecret) {
      console.warn('JWT_SECRET not configured, JWT auth disabled')
      return next()
    }

    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid Authorization header' }, 401)
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const payload = await verifyJWT(token, jwtSecret)

    if (!payload) {
      return c.json({ error: 'Invalid or expired JWT token' }, 401)
    }

    // Set user context
    c.user = payload
    c.tenantId = payload.tenant_id
    c.role = payload.role

    return next()
  }
}

/**
 * Role-based access control middleware
 * Requires JWT authentication to be run first
 */
export function requireRole(allowed: Role[]) {
  return async (c: any, next: () => Promise<void>) => {
    const role = c.role as Role
    
    if (!role) {
      return c.json({ error: 'Authentication required' }, 401)
    }

    if (!allowed.includes(role)) {
      return c.json({ error: 'Forbidden - insufficient permissions' }, 403)
    }

    return next()
  }
}

/**
 * Combined tenant and role check middleware (backwards compatible with existing code)
 * Can work with JWT or legacy header-based auth
 */
export function requireTenantAndRole(allowed: Role[]) {
  return async (c: any, next: () => Promise<void>) => {
    // If JWT auth already set context, just check role
    if (c.user && c.tenantId && c.role) {
      if (!allowed.includes(c.role)) {
        return c.json({ error: 'Forbidden' }, 403)
      }
      return next()
    }

    // Fallback to header-based auth (backwards compatibility)
    const tenantId = c.req.header('X-Tenant-Id') || c.req.header('x-tenant-id')
    const role = (c.req.header('X-Role') || c.req.header('x-role') || '') as Role
    
    if (!tenantId) {
      return c.json({ error: 'Missing X-Tenant-Id' }, 400)
    }
    
    if (!role || !(['admin','auditor','analyst','read-only'] as Role[]).includes(role)) {
      return c.json({ error: 'Invalid role' }, 403)
    }
    
    if (!allowed.includes(role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    
    c.tenantId = tenantId
    c.role = role
    return next()
  }
}
