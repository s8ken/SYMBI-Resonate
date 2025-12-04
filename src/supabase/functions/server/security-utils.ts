export type Role = 'admin' | 'auditor' | 'analyst' | 'read-only'

export interface TenantContext {
  tenantId?: string
  role?: Role
}

const OPEN_PATHS = [
  '/healthz',
  '/readyz',
  '/metrics',
  '/metrics.json',
  '/make-server-f9ece59c/health'
]

export function parseBearerToken(headerValue?: string | null): string | null {
  if (!headerValue) return null
  const trimmed = headerValue.trim()
  if (!trimmed.toLowerCase().startsWith('bearer ')) return null
  const token = trimmed.slice(7).trim()
  return token.length > 0 ? token : null
}

export function shouldSkipAuth(pathname: string): boolean {
  return OPEN_PATHS.some((openPath) => pathname.startsWith(openPath))
}

export function resolveTenantContext(headers: Record<string, string | undefined | null>): TenantContext {
  const normalized = Object.entries(headers).reduce<Record<string, string | undefined>>((acc, [key, value]) => {
    acc[key.toLowerCase()] = value ?? undefined
    return acc
  }, {})

  const tenantId = normalized['x-tenant-id'] || normalized['tenant-id']
  const role = normalized['x-role'] as Role | undefined

  return { tenantId, role }
}

export function isDemoMode(env: Record<string, string | undefined>): boolean {
  return env.DEMO_MODE === 'true'
}
