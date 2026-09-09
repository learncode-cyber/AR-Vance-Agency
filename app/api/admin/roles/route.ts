import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createRoleSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const roles = await prisma.role.findMany({
      where: { active: true },
      orderBy: { level: 'asc' },
    })

    return NextResponse.json({
      data: roles.map((role) => ({
        ...role,
        permissions: JSON.parse(role.permissions),
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createRoleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const role = await prisma.role.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description || '',
        permissions: JSON.stringify(parsed.data.permissions),
        roleType: 'custom',
        level: 99,
      },
    })

    return NextResponse.json(
      {
        data: { ...role, permissions: JSON.parse(role.permissions) },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}
