import { cookies } from 'next/headers'
import { verifyToken, COOKIE_NAME } from './auth'
import { hasPermission } from './rbac'

/**
 * Session adapter for the AI / agent / knowledge / memory / journal / audit /
 * evidence / approval / permissions API routes.
 *
 * Those routes were written against a NextAuth-style `auth()` returning
 * `{ user: { id, organizationId } }`, but this app authenticates with its own
 * JWT cookie (see lib/auth.ts) and has no Organization model — so the import
 * pointed at an export that never existed and every one of those routes threw
 * at runtime. This adapter provides the shape they expect, backed by the real
 * session, AND requires a permission so that being logged in alone is not
 * enough to drive AI agents.
 *
 * Returns null when there is no valid session OR the user lacks the
 * permission — callers respond 401 in both cases (deny by default).
 */
export interface AiSession {
  user: {
    id: string
    email: string
    role: string
    /** No multi-tenancy exists; kept as a constant so AITask.organizationId is populated. */
    organizationId: string
  }
}

const DEFAULT_ORGANIZATION_ID = 'default'

async function sessionRequiring(permission: string): Promise<AiSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  if (!(await hasPermission(payload.userId, permission))) return null

  return {
    user: {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      organizationId: DEFAULT_ORGANIZATION_ID,
    },
  }
}

/** For AI / agent / knowledge / memory / journal / audit / evidence / approval routes. */
export const auth = () => sessionRequiring('manage_ai')

/** For /api/permissions/* (role & permission administration). */
export const authForRoles = () => sessionRequiring('manage_roles')
