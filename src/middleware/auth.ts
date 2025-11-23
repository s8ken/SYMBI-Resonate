import type { Request, Response, NextFunction } from 'express'

export interface AuthenticatedUser {
  id: string
  organizationId: string
  role?: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.header('X-User-Id') || req.header('x-user-id')
  const orgId = req.header('X-Organization-Id') || req.header('x-organization-id')
  const role = req.header('X-Role') || req.header('x-role')
  if (!userId || !orgId) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  req.user = { id: String(userId), organizationId: String(orgId), role: role || 'viewer' }
  next()
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header('X-User-Id') || req.header('x-user-id')
  const orgId = req.header('X-Organization-Id') || req.header('x-organization-id')
  const role = req.header('X-Role') || req.header('x-role')
  if (userId && orgId) {
    req.user = { id: String(userId), organizationId: String(orgId), role: role || 'viewer' }
  }
  next()
}