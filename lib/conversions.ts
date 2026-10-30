import { getSettings } from '@/lib/settings'
import { sendMetaCapiLead } from '@/lib/meta-capi'
import { sendGA4Event } from '@/lib/ga4-measurement-protocol'
import { uploadGoogleAdsClickConversion } from '@/lib/google-ads-api'

/**
 * Shared server-side conversion dispatch — extracted from
 * app/api/contact/route.ts's original fireServerSideConversions(), which
 * only ever fired for the contact form. Before this, the master prompt's
 * requested event taxonomy (PageView, LeadStarted, LeadSubmitted,
 * ConsultationRequested, ProposalRequested, Purchase) was almost entirely
 * unimplemented: consultation bookings (app/api/booking/create) and order
 * completion (app/api/orders) never fired any conversion event at all —
 * only the contact form did.
 *
 * Deliberately fire-and-forget from every caller: a failed/unconfigured ad
 * platform must never fail the visitor-facing request. Each platform
 * independently no-ops if its Settings fields aren't configured.
 */
export interface ConversionInput {
  /** GA4 recommended event name: 'generate_lead' | 'schedule' | 'purchase' | etc. */
  ga4EventName: string
  /** The CRM record's id (Lead/Consultation/Order) — used as a GA4 client_id fallback and Meta dedup fallback. */
  recordId: string
  /** Meta Pixel/CAPI dedup id. Must match the id the client-side Pixel fired
   * with, if any — falls back to recordId when the client didn't supply one. */
  metaEventId?: string
  email?: string
  phone?: string
  fbp?: string
  fbc?: string
  gclid?: string
  ga4ClientId?: string
  landingPage?: string
  ip?: string
  userAgent?: string
  /** Extra GA4 event params beyond the record id — e.g. value/currency for 'purchase'. */
  ga4Params?: Record<string, unknown>
  /** Value/currency for Google Ads conversion value tracking, if applicable. */
  conversionValue?: number
  currencyCode?: string
}

export interface ConversionResult {
  ok: boolean
  error?: string
}

export interface ConversionResults {
  meta?: ConversionResult
  ga4?: ConversionResult
  googleAds?: ConversionResult
}

export async function fireServerSideConversions(input: ConversionInput): Promise<ConversionResults> {
  const s = await getSettings()
  const eventTime = new Date()
  const results: ConversionResults = {}

  // ── Meta Conversions API ── (needs at least email or phone to match a person)
  if (s.metaPixelId && s.metaAccessToken && (input.email || input.phone)) {
    results.meta = await sendMetaCapiLead({
      pixelId: s.metaPixelId,
      accessToken: s.metaAccessToken,
      testEventCode: s.metaTestEventCode || undefined,
      eventId: input.metaEventId || input.recordId,
      email: input.email,
      phone: input.phone || undefined,
      fbp: input.fbp || undefined,
      fbc: input.fbc || undefined,
      clientIpAddress: input.ip || undefined,
      clientUserAgent: input.userAgent || undefined,
      eventSourceUrl: input.landingPage || s.seoDefaultTitle,
    })
  }

  // ── GA4 Measurement Protocol ──
  if (s.ga4MeasurementId && s.ga4ApiSecret) {
    results.ga4 = await sendGA4Event({
      measurementId: s.ga4MeasurementId,
      apiSecret: s.ga4ApiSecret,
      clientId: input.ga4ClientId || input.recordId,
      eventName: input.ga4EventName,
      params: { record_id: input.recordId, ...input.ga4Params },
    })
  }

  // ── Google Ads API (click conversion upload) ──
  if (
    input.gclid &&
    s.googleAdsDeveloperToken && s.googleAdsOAuthClientId && s.googleAdsOAuthClientSecret &&
    s.googleAdsRefreshToken && s.googleAdsCustomerId && s.googleAdsConversionActionId
  ) {
    results.googleAds = await uploadGoogleAdsClickConversion({
      developerToken: s.googleAdsDeveloperToken,
      oauthClientId: s.googleAdsOAuthClientId,
      oauthClientSecret: s.googleAdsOAuthClientSecret,
      refreshToken: s.googleAdsRefreshToken,
      customerId: s.googleAdsCustomerId,
      loginCustomerId: s.googleAdsLoginCustomerId || undefined,
      conversionActionId: s.googleAdsConversionActionId,
      gclid: input.gclid,
      conversionDateTime: eventTime,
      conversionValue: input.conversionValue,
      currencyCode: input.currencyCode,
    })
  }

  return results
}
