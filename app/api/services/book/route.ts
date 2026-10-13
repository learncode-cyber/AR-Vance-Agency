import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { sendContactEmail } from '@/lib/email'

const bookingSchema = z.object({
  fullName: z.string().min(2).max(100),
  companyName: z.string().max(200).optional(),
  email: z.string().email().max(200),
  phone: z.string().min(3).max(40),
  service: z.string().min(1).max(200),
  date: z.string().min(1).max(40),
  time: z.string().min(1).max(40),
  requirements: z.string().max(1000).optional(),
})

// Used by the Automation Services page booking form.
// Before: validated, console.log'ed the visitor's details and returned a made-up
// "BK-<timestamp>" id — the booking was never stored or emailed, so every request
// from this form was silently lost while the visitor saw "success".
// Now: saved as a CRM lead (source "service_booking") + notification email.
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!(await rateLimit(ip, 'service-book', 10, 60 * 60)).success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const parsed = bookingSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data', details: parsed.error.errors }, { status: 400 })
  }
  const d = parsed.data

  try {
    const message =
      `Requested slot: ${d.date} ${d.time}\n` +
      `Service: ${d.service}\n` +
      (d.requirements ? `Requirements: ${d.requirements}` : 'Requirements: —')

    const lead = await prisma.lead.create({
      data: {
        name: d.fullName,
        email: d.email,
        phone: d.phone,
        company: d.companyName || '',
        subject: `Service booking: ${d.service}`,
        service: 'automation-services',
        message,
        source: 'service_booking',
        stage: 'new',
      },
      select: { id: true },
    })

    // Notification must never turn a saved booking into an error for the visitor.
    sendContactEmail({ name: d.fullName, email: d.email, subject: `Service booking: ${d.service}`, service: d.service, message: `${message}\nPhone: ${d.phone}${d.companyName ? `\nCompany: ${d.companyName}` : ''}` }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Booking submitted successfully', bookingId: lead.id })
  } catch (error) {
    console.error('[service-book] failed to save booking:', (error as Error).name)
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 })
  }
}
