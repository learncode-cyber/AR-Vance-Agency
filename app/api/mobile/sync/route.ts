import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const syncSchema = z.object({
  deviceId: z.string(),
  actions: z.array(
    z.object({
      action: z.enum(['create', 'update', 'delete']),
      dataType: z.string(),
      endpoint: z.string(),
      payload: z.record(z.any()),
    })
  ),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = syncSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const { deviceId, actions } = parsed.data

    // Add actions to sync queue
    const syncItems = await Promise.all(
      actions.map((action) =>
        prisma.offlineSyncQueue.create({
          data: {
            deviceId,
            action: action.action,
            endpoint: action.endpoint,
            dataType: action.dataType,
            payload: JSON.stringify(action.payload),
          },
        })
      )
    )

    return NextResponse.json({
      data: {
        queuedItems: syncItems.length,
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to queue sync items' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const deviceId = url.searchParams.get('deviceId')

  if (!deviceId) {
    return NextResponse.json(
      { error: 'Device ID required' },
      { status: 400 }
    )
  }

  try {
    const pending = await prisma.offlineSyncQueue.findMany({
      where: {
        deviceId,
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })

    return NextResponse.json({ data: pending })
  } catch (error) {
    console.error('Fetch pending sync error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending sync' },
      { status: 500 }
    )
  }
}
