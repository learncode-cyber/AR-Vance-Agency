import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const trackEventSchema = z.object({
  deviceId: z.string(),
  eventName: z.string(),
  eventData: z.record(z.any()).optional(),
  screenName: z.string().optional(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = trackEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const { deviceId, eventName, eventData, screenName } = parsed.data

    // Update device last active
    await prisma.deviceRegistration.update({
      where: { deviceId },
      data: { lastActive: new Date() },
    })

    // In production, store events to analytics service
    // For now, just acknowledge receipt
    console.log(`Event tracked: ${eventName} from ${deviceId}`)

    return NextResponse.json({
      data: {
        tracked: true,
        eventName,
      },
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

// Get analytics summary
export async function GET(req: Request) {
  const url = new URL(req.url)
  const days = parseInt(url.searchParams.get('days') || '30')

  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [activeDevices, totalSessions, iosUsers, androidUsers] = await Promise.all([
      prisma.deviceRegistration.count({
        where: {
          lastActive: { gte: startDate },
          active: true,
        },
      }),
      prisma.deviceRegistration.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.deviceRegistration.count({
        where: {
          deviceType: 'ios',
          active: true,
        },
      }),
      prisma.deviceRegistration.count({
        where: {
          deviceType: 'android',
          active: true,
        },
      }),
    ])

    return NextResponse.json({
      data: {
        activeDevices,
        totalSessions,
        platformBreakdown: {
          ios: iosUsers,
          android: androidUsers,
        },
      },
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
