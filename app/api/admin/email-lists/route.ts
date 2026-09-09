import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createListSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  fromEmail: z.string().email(),
  fromName: z.string(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const lists = await prisma.emailList.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { subscribers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      data: lists.map((list) => ({
        ...list,
        subscriberCount: list._count.subscribers,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 })
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
  const parsed = createListSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const list = await prisma.emailList.create({
      data: parsed.data,
    })

    await logActivity(session.userId, 'email_list_created', 'email', list.id, list.name)

    return NextResponse.json({ data: list }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 })
  }
}
