import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const slotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isAvailable: z.boolean().optional().default(true),
  maxBookings: z.number().min(1).optional().default(1),
  note: z.string().optional().default(''),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  try {
    const slots = await prisma.consultationSlot.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    })

    return NextResponse.json({ data: slots })
  } catch (error) {
    console.error('Slots fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = slotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  try {
    const slot = await prisma.consultationSlot.create({
      data: parsed.data,
    })

    return NextResponse.json({ data: slot }, { status: 201 })
  } catch (error) {
    console.error('Create slot error:', error)
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 })
  }
}
