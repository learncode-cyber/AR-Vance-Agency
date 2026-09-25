import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { getSettings } from '@/lib/settings'

const schema = z.object({
  siteName:         z.string().min(1).max(150).optional(),
  tagline:          z.string().max(300).optional(),
  siteDescription:  z.string().max(500).optional(),
  founded:          z.string().max(10).optional(),
  contactEmail:     z.string().email().optional(),
  contactPhone:     z.string().max(50).optional(),
  address:          z.string().max(200).optional(),
  socialLinkedin:   z.string().max(300).optional(),
  socialTwitter:    z.string().max(300).optional(),
  socialFacebook:   z.string().max(300).optional(),
  socialInstagram:  z.string().max(300).optional(),
  heroBadge:        z.string().max(100).optional(),
  heroTitle:        z.string().max(150).optional(),
  heroTitleAccent:  z.string().max(150).optional(),
  heroSubtitle:     z.string().max(500).optional(),
  heroCtaPrimary:   z.string().max(50).optional(),
  heroCtaSecondary: z.string().max(50).optional(),
  ctaTitle:         z.string().max(150).optional(),
  ctaSubtitle:      z.string().max(500).optional(),
  ctaButton:        z.string().max(50).optional(),
  seoDefaultTitle:  z.string().max(200).optional(),
  seoDefaultDesc:   z.string().max(300).optional(),
  seoTitleTemplate: z.string().max(100).optional(),
  ga4MeasurementId:          z.string().max(30).optional(),
  metaPixelId:               z.string().max(30).optional(),
  googleAdsConversionId:     z.string().max(30).optional(),
  googleAdsConversionLabel:  z.string().max(50).optional(),
  parentBrandName:           z.string().max(100).optional(),
  parentBrandUrl:            z.string().max(300).optional(),
  parentBrandRelationship:   z.string().max(200).optional(),
  parentBrandShort:          z.string().max(50).optional(),
  metaAccessToken:             z.string().max(1000).optional(),
  metaTestEventCode:           z.string().max(50).optional(),
  ga4ApiSecret:                z.string().max(200).optional(),
  googleAdsDeveloperToken:     z.string().max(200).optional(),
  googleAdsOAuthClientId:      z.string().max(300).optional(),
  googleAdsOAuthClientSecret:  z.string().max(300).optional(),
  googleAdsCustomerId:         z.string().max(20).optional(),
  googleAdsLoginCustomerId:    z.string().max(20).optional(),
  googleAdsConversionActionId: z.string().max(50).optional(),
})

export async function GET() {
  const session = await getAdminSession()
  if (!session) return unauthorized()
  const settings = await getSettings()
  return NextResponse.json({ data: settings })
}

export async function PATCH(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }

  const updated = await prisma.settings.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  })
  return NextResponse.json({ data: updated })
}
