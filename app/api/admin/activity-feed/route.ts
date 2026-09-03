import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

  const where: any = { userId: session.userId }
  if (unreadOnly) where.read = false

  try {
    const [activities, total] = await Promise.all([
      prisma.activityFeed.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityFeed.count({ where }),
    ])

    return NextResponse.json({
      data: activities,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activity feed' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const activityId = url.searchParams.get('id')

  if (!activityId) {
    return NextResponse.json({ error: 'Activity ID required' }, { status: 400 })
  }

  try {
    const activity = await prisma.activityFeed.update({
      where: { id: activityId },
      data: { read: true },
    })

    return NextResponse.json({ data: activity })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 })
  }
}
