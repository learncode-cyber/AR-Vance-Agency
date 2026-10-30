import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { dayRangeUtc, isPast, parseSlotDateTime } from '@/lib/booking'

// Availability = weekly slot template (ConsultationSlot) minus consultations that are
// already booked on that specific date. Previously "available" came from a per-weekly-slot
// counter that never changed, so a booked time was offered to everyone again.
// Also 14 sequential queries -> 2 queries.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const serviceId = url.searchParams.get('serviceId')
  const days = Math.min(60, Math.max(1, parseInt(url.searchParams.get('days') || '14') || 14))

  if (!serviceId) return NextResponse.json({ error: 'serviceId required' }, { status: 400 })

  try {
    const now = new Date()
    const startDate = now.toISOString().slice(0, 10)
    const rangeStart = dayRangeUtc(startDate).start
    const rangeEnd = new Date(rangeStart.getTime() + days * 86_400_000)

    const [templates, booked] = await Promise.all([
      prisma.consultationSlot.findMany({ where: { isAvailable: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }], take: 500 }),
      prisma.consultation.findMany({
        where: { date: { gte: rangeStart, lt: rangeEnd }, status: { not: 'cancelled' } },
        select: { date: true, startTime: true },
        take: 5000,
      }),
    ])

    const bookedCount = new Map<string, number>()
    for (const b of booked) {
      const k = `${b.date.toISOString().slice(0, 10)}|${b.startTime}`
      bookedCount.set(k, (bookedCount.get(k) ?? 0) + 1)
    }

    const slots: { date: string; time: string; available: boolean }[] = []
    for (let i = 0; i < days; i++) {
      const d = new Date(rangeStart.getTime() + i * 86_400_000)
      const date = d.toISOString().slice(0, 10)
      for (const t of templates.filter((t) => t.dayOfWeek === d.getUTCDay())) {
        const at = parseSlotDateTime(date, t.startTime)
        if (!at || isPast(at, now, 60)) continue // hide slots in the past / starting within the hour
        slots.push({ date, time: t.startTime, available: (bookedCount.get(`${date}|${t.startTime}`) ?? 0) < t.maxBookings })
      }
    }
    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Availability fetch error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}
