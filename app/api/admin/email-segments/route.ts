import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createSegmentSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  listId: z.string(),
  description: z.string().optional(),
  criteria: z.record(z.any()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const listId = url.searchParams.get('listId')

  const where: any = { active: true }
  if (listId) where.listId = listId

  try {
    const segments = await prisma.emailSegment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: segments })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const hasAccess = await hasPermission(session.userId, 'manage_content')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSegmentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const segment = await prisma.emailSegment.create({
      data: {
        ...parsed.data,
        criteria: parsed.data.criteria ? JSON.stringify(parsed.data.criteria) : '{}',
      },
    })

    await logActivity(session.userId, 'segment_created', 'email', segment.id, segment.name)

    return NextResponse.json({ data: segment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 })
  }
}
