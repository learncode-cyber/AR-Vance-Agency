import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendContactEmail } from '@/lib/email'
import { getSettings } from '@/lib/settings'
import { sendMetaCapiLead } from '@/lib/meta-capi'
import { sendGA4Event } from '@/lib/ga4-measurement-protocol'
import { uploadGoogleAdsClickConversion } from '@/lib/google-ads-api'

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
      fireServerSideConversions({ lead, email, phone, fbp, fbc, gclid, eventId, ga4ClientId, landingPage, ip, userAgent })
        .catch(err => console.error('[contact] Server-side conversion dispatch error:', err))
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 500 })
  }
}

interface ConversionInput {
  lead: { id: string }
  email: string
  phone: string
  fbp: string
  fbc: string
  gclid: string
  eventId: string
  ga4ClientId: string
  landingPage: string
  ip: string
  userAgent: string
}

async function fireServerSideConversions(input: ConversionInput) {
  const s = await getSettings()
  const eventTime = new Date()

  // ── Meta Conversions API ──
  if (s.metaPixelId && s.metaAccessToken) {
    const result = await sendMetaCapiLead({
      pixelId: s.metaPixelId,
      accessToken: s.metaAccessToken,
      testEventCode: s.metaTestEventCode || undefined,
      eventId: input.eventId || input.lead.id,
      email: input.email,
      phone: input.phone || undefined,
      fbp: input.fbp || undefined,
      fbc: input.fbc || undefined,
      clientIpAddress: input.ip || undefined,
      clientUserAgent: input.userAgent || undefined,
      eventSourceUrl: input.landingPage || s.seoDefaultTitle,
    })
    await prisma.lead.update({
      where: { id: input.lead.id },
      data: { metaCapiSentAt: eventTime, metaCapiStatus: result.ok ? 'sent' : `failed: ${result.error?.slice(0, 200)}` },
    }).catch(() => {})
  }

  // ── GA4 Measurement Protocol ──
  if (s.ga4MeasurementId && s.ga4ApiSecret) {
    const result = await sendGA4Event({
      measurementId: s.ga4MeasurementId,
      apiSecret: s.ga4ApiSecret,
      clientId: input.ga4ClientId || input.lead.id,
      eventName: 'generate_lead',
      params: { lead_id: input.lead.id },
    })
    await prisma.lead.update({
      where: { id: input.lead.id },
      data: { ga4SentAt: eventTime, ga4Status: result.ok ? 'sent' : `failed: ${result.error?.slice(0, 200)}` },
    }).catch(() => {})
  }

  // ── Google Ads API (click conversion upload) ──
  if (
    input.gclid &&
    s.googleAdsDeveloperToken && s.googleAdsOAuthClientId && s.googleAdsOAuthClientSecret &&
    s.googleAdsRefreshToken && s.googleAdsCustomerId && s.googleAdsConversionActionId
  ) {
    const result = await uploadGoogleAdsClickConversion({
      developerToken: s.googleAdsDeveloperToken,
      oauthClientId: s.googleAdsOAuthClientId,
      oauthClientSecret: s.googleAdsOAuthClientSecret,
      refreshToken: s.googleAdsRefreshToken,
      customerId: s.googleAdsCustomerId,
      loginCustomerId: s.googleAdsLoginCustomerId || undefined,
      conversionActionId: s.googleAdsConversionActionId,
      gclid: input.gclid,
      conversionDateTime: eventTime,
    })
    await prisma.lead.update({
      where: { id: input.lead.id },
      data: { googleAdsSentAt: eventTime, googleAdsStatus: result.ok ? 'sent' : `failed: ${result.error?.slice(0, 200)}` },
    }).catch(() => {})
  }
}
