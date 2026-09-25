import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const bookingSchema = z.object({
  serviceId: z.string().min(1),
  clientName: z.string().min(2),
  clientEmail: z.string().email(),
  clientPhone: z.string().min(5),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional().default(''),
  meetingType: z.string().optional().default('zoom'),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid data' },
      { status: 400 }
    )
  }

  const { serviceId, clientName, clientEmail, clientPhone, date, time, notes, meetingType } = parsed.data

  try {
    // Get service details
    const service = await prisma.consultationService.findUniqueOrThrow({
      where: { id: serviceId },
    })

    // Create consultation datetime
    const [hours, minutes] = time.split(':').map(Number)
    const dateTime = new Date(date)
    dateTime.setHours(hours, minutes, 0, 0)

    // Calculate end time
    const endTime = new Date(dateTime)
    endTime.setMinutes(endTime.getMinutes() + service.duration)

    // Generate Zoom link (mock - in production use Zoom API)
    const meetingLink = `https://zoom.us/j/${Math.random().toString(36).substring(2, 11)}`

    // Create consultation
    const consultation = await prisma.consultation.create({
      data: {
        title: `Consultation: ${service.name}`,
        description: notes,
        clientName,
        clientEmail,
        clientPhone,
        date: dateTime,
        startTime: time,
        endTime: endTime.toTimeString().substring(0, 5),
        duration: service.duration,
        status: 'confirmed',
        meetingType,
        meetingLink,
      },
    })

    // TODO: Send confirmation email here

    return NextResponse.json(
      { 
        data: consultation,
        message: 'Consultation booked successfully! Check your email for details.'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
