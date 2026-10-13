import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendContactEmail } from '@/lib/email'
import { fireServerSideConversions } from '@/lib/conversions'

const schema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  phone:   z.string().max(50).optional().default(''),
  company: z.string().max(150).optional().default(''),
  subject: z.string().min(2).max(150),
  service: z.string().max(100).optional().default(''),
  message: z.string().min(20).max(5000),
  // Attribution — captured client-side, all optional
  gclid:       z.string().max(200).optional().default(''),
  fbclid:      z.string().max(200).optional().default(''),
  fbp:         z.string().max(200).optional().default(''),
  fbc:         z.string().max(200).optional().default(''),
  landingPage: z.string().max(500).optional().default(''),
  eventId:     z.string().max(100).optional().default(''), // shared with client-side pixel for Meta dedup
  ga4ClientId: z.string().max(100).optional().default(''),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]
      return NextResponse.json({ error: firstError?.message ?? 'Invalid form data.' }, { status: 400 })
    }

    const {
      name, email, phone, company, subject, service, message,
      gclid, fbclid, fbp, fbc, landingPage, eventId, ga4ClientId,
    } = parsed.data

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? ''
    const userAgent = req.headers.get('user-agent') ?? ''

    // 1. Save as a CRM Lead (visible in admin panel's Leads pipeline)
    let lead
    try {
      lead = await prisma.lead.create({
        data: {
          name, email, phone, company, subject, service, message,
          source: 'contact_form', stage: 'new',
          gclid, fbclid, fbp, fbc, landingPage, ip, userAgent,
        },
      })
    } catch (dbErr) {
      console.error('[contact] Failed to save lead to DB:', dbErr)
    }

    // 2. Send notification + auto-reply email (blocking — this is the
    //    core "did the form work" signal for the visitor)
    await sendContactEmail({ name, email, subject, service, message })

    // 3. Fire server-side ad-platform conversions — all fire-and-forget,
    //    never block or fail the visitor-facing response. Each one
    //    independently checks whether it's configured (Settings) before
    //    attempting anything.
    if (lead) {
      fireServerSideConversions({
        ga4EventName: 'generate_lead',
        recordId: lead.id,
        metaEventId: eventId || lead.id,
        email, phone, fbp, fbc, gclid,
        ga4ClientId: ga4ClientId || lead.id,
        landingPage, ip, userAgent,
      })
        .then(results => {
          // Keep the per-platform delivery status visible on the Lead
          // record for admins (CRM lead detail view), same as before.
          const now = new Date()
          return prisma.lead.update({
            where: { id: lead.id },
            data: {
              ...(results.meta && { metaCapiSentAt: now, metaCapiStatus: results.meta.ok ? 'sent' : `failed: ${results.meta.error?.slice(0, 200)}` }),
              ...(results.ga4 && { ga4SentAt: now, ga4Status: results.ga4.ok ? 'sent' : `failed: ${results.ga4.error?.slice(0, 200)}` }),
              ...(results.googleAds && { googleAdsSentAt: now, googleAdsStatus: results.googleAds.ok ? 'sent' : `failed: ${results.googleAds.error?.slice(0, 200)}` }),
            },
          })
        })
        .catch(err => console.error('[contact] Server-side conversion dispatch error:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 })
  }
}
