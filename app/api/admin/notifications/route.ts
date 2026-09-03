import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = { userId: session.userId }
  if (unreadOnly) where.read = false

  try {
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: session.userId, read: false },
      }),
    ])

    return NextResponse.json({
      data: notifications,
      unreadCount,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const notificationId = url.searchParams.get('id')
  const markAll = url.searchParams.get('markAll') === 'true'

  try {
    if (markAll) {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: session.userId, read: false },
        data: { read: true, readAt: new Date() },
      })
      return NextResponse.json({ data: { markedAll: true } })
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID required' }, { status: 400 })
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    })

    return NextResponse.json({ data: notification })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
