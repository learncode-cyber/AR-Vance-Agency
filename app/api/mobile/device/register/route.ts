import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const registerDeviceSchema = z.object({
  deviceId: z.string().min(1),
  deviceName: z.string().min(1),
  deviceType: z.enum(['ios', 'android']),
  osVersion: z.string().min(1),
  appVersion: z.string().min(1),
  pushToken: z.string().min(1),
  userEmail: z.string().email().optional(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = registerDeviceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    // Check if device exists
    const existingDevice = await prisma.deviceRegistration.findUnique({
      where: { deviceId: parsed.data.deviceId },
    })

    let device

    if (existingDevice) {
      // Update existing device
      device = await prisma.deviceRegistration.update({
        where: { deviceId: parsed.data.deviceId },
        data: {
          ...parsed.data,
          lastActive: new Date(),
        },
      })
    } else {
      // Create new device
      device = await prisma.deviceRegistration.create({
        data: parsed.data,
      })
    }

    return NextResponse.json({
      data: {
        deviceId: device.deviceId,
        registered: true,
      },
    })
  } catch (error) {
    console.error('Device registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    )
  }
}
