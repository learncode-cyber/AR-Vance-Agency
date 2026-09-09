import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const serviceId = url.searchParams.get('serviceId')
  const days = parseInt(url.searchParams.get('days') || '14')

  if (!serviceId) {
    return NextResponse.json({ error: 'serviceId required' }, { status: 400 })
  }

  try {
    const slots: any[] = []
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)

      const dayOfWeek = date.getDay()

      // Find slots for this day of week
      const daySlots = await prisma.consultationSlot.findMany({
        where: {
          dayOfWeek,
          isAvailable: true,
        },
      })

      daySlots.forEach((slot) => {
        slots.push({
          date: date.toISOString().split('T')[0],
          time: slot.startTime,
          available: slot.currentBookings < slot.maxBookings,
        })
      })
    }

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Availability fetch error:', error)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}
