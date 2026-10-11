import { NextResponse } from 'next/server'
import { getAdminSession } from './api-auth'
import { hasPermission } from './rbac'

/**
 * Middleware to check permissions
 */
export async function requirePermission(requiredPermission: string) {
  const session = await getAdminSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const hasAccess = await hasPermission(session.userId, requiredPermission)

  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Access Denied - Insufficient permissions' },
      { status: 403 }
    )
  }

  return { allowed: true, session }
}

/**
 * Check if user is admin
 */
export async function requireAdmin() {
  const session = await getAdminSession()

  if (!session) {
    return { allowed: false, error: 'Unauthorized' }
  }

  // Check if user is admin (has manage_users permission)
  const isAdmin = await hasPermission(session.userId, 'manage_users')

  if (!isAdmin) {
    return { allowed: false, error: 'Admin access required' }
  }

  return { allowed: true, session }
}

/**
 * Get permission guard response
 */
export function permissionDenied(message: string = 'Access Denied') {
  return NextResponse.json(
    { error: message, code: 'PERMISSION_DENIED' },
    { status: 403 }
  )
}
