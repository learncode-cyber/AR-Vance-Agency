import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const sendNotificationSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  deviceIds: z.string().default('all'),  // comma-separated or "all"
  data: z.record(z.string()).optional().default({}),
})

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = sendNotificationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const { title, body: bodyText, deviceIds, data } = parsed.data

    const notification = await prisma.pushNotification.create({
      data: {
        title,
        body: bodyText,
        deviceIds,
        data: JSON.stringify(data),
        status: 'pending',
      },
    })

    // In production, send to push service (FCM, APNs)
    // For now, just queue it
    if (deviceIds === 'all') {
      // Send to all devices
      const devices = await prisma.deviceRegistration.findMany({
        where: { active: true },
        select: { pushToken: true },
      })
      console.log(`Queueing notification for ${devices.length} devices`)
    }

    return NextResponse.json({
      data: {
        notificationId: notification.id,
        status: 'pending',
      },
    })
  } catch (error) {
    console.error('Push notification error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    const [notifications, total] = await Promise.all([
      prisma.pushNotification.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pushNotification.count(),
    ])

    return NextResponse.json({
      data: notifications,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
