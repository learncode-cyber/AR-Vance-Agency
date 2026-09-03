import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const addSubscriberSchema = z.object({
  listId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const listId = url.searchParams.get('listId')
  const status = url.searchParams.get('status')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  if (!listId) {
    return NextResponse.json({ error: 'listId required' }, { status: 400 })
  }

  const where: any = { listId }
  if (status) where.status = status

  try {
    const [subscribers, total] = await Promise.all([
      prisma.emailSubscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.emailSubscriber.count({ where }),
    ])

    return NextResponse.json({
      data: subscribers,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = addSubscriberSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    // Check if subscriber already exists
    const existing = await prisma.emailSubscriber.findUnique({
      where: {
        email_listId: {
          email: parsed.data.email,
          listId: parsed.data.listId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Subscriber already exists' }, { status: 409 })
    }

    const subscriber = await prisma.emailSubscriber.create({
      data: {
        ...parsed.data,
        verified: true, // Auto-verify for admin-added subscribers
      },
    })

    // Update list subscriber count
    await prisma.emailList.update({
      where: { id: parsed.data.listId },
      data: { subscriberCount: { increment: 1 } },
    })

    await logActivity(
      session.userId,
      'subscriber_added',
      'email',
      subscriber.id,
      parsed.data.email
    )

    return NextResponse.json({ data: subscriber }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add subscriber' }, { status: 500 })
  }
}
