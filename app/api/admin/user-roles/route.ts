import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { assignRole, removeRole, logActivity } from '@/lib/rbac'

const assignRoleSchema = z.object({
  userId: z.string(),
  roleId: z.string(),
  expiresAt: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    })

    return NextResponse.json({
      data: userRoles.map((ur) => ({
        id: ur.id,
        roleId: ur.roleId,
        roleName: ur.role.name,
        roleSlug: ur.role.slug,
        assignedAt: ur.assignedAt,
        expiresAt: ur.expiresAt,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = assignRoleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: parsed.data.roleId },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    await assignRole(
      parsed.data.userId,
      parsed.data.roleId,
      parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined
    )

    // Log activity
    await logActivity(
      session.userId,
      'role_assigned',
      'user',
      parsed.data.userId,
      `Assigned role: ${role.name}`
    )

    return NextResponse.json(
      { data: { success: true, message: 'Role assigned' } },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const userRoleId = url.searchParams.get('userRoleId')

  if (!userRoleId) {
    return NextResponse.json({ error: 'userRoleId required' }, { status: 400 })
  }

  try {
    const userRole = await prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: { role: true },
    })

    if (!userRole) {
      return NextResponse.json({ error: 'User role not found' }, { status: 404 })
    }

    await removeRole(userRole.userId, userRole.roleId)

    // Log activity
    await logActivity(
      session.userId,
      'role_removed',
      'user',
      userRole.userId,
      `Removed role: ${userRole.role.name}`
    )

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove role' }, { status: 500 })
  }
}
