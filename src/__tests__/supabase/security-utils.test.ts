import { isDemoMode, parseBearerToken, resolveTenantContext, shouldSkipAuth } from '../../supabase/functions/server/security-utils'

describe('security-utils', () => {
  it('parses bearer tokens correctly', () => {
    expect(parseBearerToken('Bearer test-token')).toBe('test-token')
    expect(parseBearerToken('bearer another-token')).toBe('another-token')
    expect(parseBearerToken('Token missing')).toBeNull()
    expect(parseBearerToken(undefined)).toBeNull()
  })

  it('skips auth for open paths', () => {
    expect(shouldSkipAuth('/healthz')).toBe(true)
    expect(shouldSkipAuth('/metrics')).toBe(true)
    expect(shouldSkipAuth('/make-server-f9ece59c/health')).toBe(true)
    expect(shouldSkipAuth('/secure/path')).toBe(false)
  })

  it('resolves tenant context from headers', () => {
    const { tenantId, role } = resolveTenantContext({
      'X-Tenant-Id': 'tenant-123',
      'x-role': 'admin'
    })
    expect(tenantId).toBe('tenant-123')
    expect(role).toBe('admin')
  })

  it('detects demo mode flag', () => {
    expect(isDemoMode({ DEMO_MODE: 'true' })).toBe(true)
    expect(isDemoMode({ DEMO_MODE: 'false' })).toBe(false)
  })
})
