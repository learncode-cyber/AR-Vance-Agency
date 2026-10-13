import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendConsultationConfirmationEmail } from '@/lib/email'
import { fireServerSideConversions } from '@/lib/conversions'
import { rateLimit } from '@/lib/rate-limit'
import { addMinutesHHMM, dayOfWeekUtc, dayRangeUtc, isPast, parseSlotDateTime } from '@/lib/booking'

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(5).max(40),
  date: z.string(),   // YYYY-MM-DD
  time: z.string(),   // HH:MM (24h)
  notes: z.string().max(2000).optional().default(''),
  meetingType: z.enum(['zoom', 'google_meet', 'phone', 'in_person']).optional().default('zoom'),
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'booking-create', 10, 60 * 60)).success) {
    return NextResponse.json({ error: 'Too many booking attempts. Please try again later.' }, { status: 429 })
  }

  const parsed = bookingSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }
  const { serviceId, clientName, clientEmail, clientPhone, date, time, notes, meetingType } = parsed.data

  // Previously ANY date/time was accepted (past dates, times you don't offer) and nothing
  // stopped two clients booking the same slot. Now: valid format, in the future, a slot
  // that actually exists for that weekday, and capacity is enforced.
  const dateTime = parseSlotDateTime(date, time)
  if (!dateTime) return NextResponse.json({ error: 'Invalid date or time' }, { status: 400 })
  if (isPast(dateTime, new Date(), 60)) return NextResponse.json({ error: 'Please choose a time at least one hour from now' }, { status: 400 })

  try {
    const service = await prisma.consultationService.findUnique({ where: { id: serviceId } })
    if (!service || !service.isAvailable) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

    const template = await prisma.consultationSlot.findFirst({ where: { dayOfWeek: dayOfWeekUtc(date), startTime: time, isAvailable: true } })
    if (!template) return NextResponse.json({ error: 'That time is not available' }, { status: 409 })

    const { start, end } = dayRangeUtc(date)
    const sameSlot = { date: { gte: start, lt: end }, startTime: time, status: { not: 'cancelled' } }
    if ((await prisma.consultation.count({ where: sameSlot })) >= template.maxBookings) {
      return NextResponse.json({ error: 'That time was just booked. Please pick another slot.' }, { status: 409 })
    }

    // Never invent a meeting link (the old code emailed clients a random, non-existent
    // zoom.us URL). Use the agency's configured room if there is one, else leave it blank.
    const meetingLink = process.env.MEETING_LINK_URL || ''

    const consultation = await prisma.consultation.create({
      data: {
        title: `Consultation: ${service.name}`,
        description: notes,
        clientName,
        clientEmail,
        clientPhone,
        date: dateTime,
        startTime: time,
        endTime: addMinutesHHMM(time, service.durationMinutes),
        duration: service.durationMinutes,
        status: 'confirmed',
        meetingType,
        meetingLink,
      },
    })

    // Two requests can pass the capacity check at the same moment; re-count after the
    // insert and let the later one(s) back out so the slot is never over capacity.
    const after = await prisma.consultation.findMany({ where: sameSlot, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], select: { id: true }, take: template.maxBookings + 5 })
    if (after.findIndex((c) => c.id === consultation.id) >= template.maxBookings) {
      await prisma.consultation.delete({ where: { id: consultation.id } }).catch(() => {})
      return NextResponse.json({ error: 'That time was just booked. Please pick another slot.' }, { status: 409 })
    }

    sendConsultationConfirmationEmail({
      clientName,
      clientEmail,
      title: consultation.title,
      date: dateTime,
      startTime: time,
      endTime: consultation.endTime,
      timezone: consultation.timezone,
      meetingType,
      meetingLink,
    }).catch((err) => console.error('[booking] Confirmation email failed:', err))

    fireServerSideConversions({
      ga4EventName: 'schedule',
      recordId: consultation.id,
      ga4Params: { service: service.name },
    }).catch((err) => console.error('[booking] Conversion dispatch error:', err))

    return NextResponse.json({ data: consultation, message: 'Consultation booked successfully! Check your email for details.' }, { status: 201 })
  } catch (error) {
    console.error('Booking error:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
