import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// Read-only list for the Team Management page (it called this URL but no route
// existed, so the Members tab was always empty). Never exposes password hashes
// or 2FA material.
export async function GET() {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  if (!(await hasPermission(session.userId, 'manage_users'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, fullName: true, role: true, createdAt: true, twoFactorEnabled: true,
        userRoles: { select: { role: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })
    return NextResponse.json({
      data: users.map((u) => ({
        id: u.id,
        name: u.fullName || u.email,
        email: u.email,
        role: u.userRoles[0]?.role.name ?? u.role,
        status: 'active',
        joinedAt: u.createdAt,
        twoFactorEnabled: u.twoFactorEnabled,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
