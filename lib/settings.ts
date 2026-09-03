import { cache } from 'react'
import { prisma } from './prisma'

const DEFAULTS = {
  id: 1,
  siteName: 'AR Vance Agency',
  tagline: 'Smart digital solutions for businesses worldwide.',
  siteDescription: 'AR Vance Agency delivers SEO, digital marketing, paid advertising, analytics, WordPress development and AI automation for global businesses.',
  founded: '2021',
  contactEmail: 'hello@example.com',
  contactPhone: '',
  address: '',
  socialLinkedin: '',
  socialTwitter: '',
  socialFacebook: '',
  socialInstagram: '',
  heroBadge: 'Smart Digital Solutions',
  heroTitle: 'Your Digital Success',
  heroTitleAccent: 'Starts Today',
  heroSubtitle: 'We offer innovative web design, SEO, and digital marketing services for businesses worldwide.',
  heroCtaPrimary: 'Get Started',
  heroCtaSecondary: 'Our Services',
  ctaTitle: 'Ready to Elevate Your Brand?',
  ctaSubtitle: "Let's build a strategy that transforms your business and drives real results.",
  ctaButton: 'Contact Us Today',
  seoDefaultTitle: 'AR Vance Agency — SEO, Digital Marketing & Web Development',
  seoDefaultDesc: 'Expert SEO, digital marketing, paid ads, analytics, WordPress development and AI automation.',
  seoTitleTemplate: '%s | AR Vance Agency',
  ga4MeasurementId: '',
  metaPixelId: '',
  googleAdsConversionId: '',
  googleAdsConversionLabel: '',
  parentBrandName: 'AR Qudrix',
  parentBrandUrl: 'https://arqudrix.com',
  parentBrandRelationship: 'A Digital & Technology Company by AR Qudrix',
  parentBrandShort: 'by AR Qudrix',
  metaAccessToken: '',
  metaTestEventCode: '',
  ga4ApiSecret: '',
  googleAdsDeveloperToken: '',
  googleAdsOAuthClientId: '',
  googleAdsOAuthClientSecret: '',
  googleAdsRefreshToken: '',
  googleAdsCustomerId: '',
  googleAdsLoginCustomerId: '',
  googleAdsConversionActionId: '',
}

/**
 * Returns the single Settings row, auto-creating it with sane defaults
 * on first run (so a fresh DB never crashes the site).
 */
export const getSettings = cache(async function getSettings() {
  try {
    const existing = await prisma.settings.findUnique({ where: { id: 1 } })
    if (existing) return existing
    return await prisma.settings.create({ data: DEFAULTS })
  } catch {
    // DB not reachable (e.g. during build without DATABASE_URL) — fall back to defaults
    return DEFAULTS as unknown as Awaited<ReturnType<typeof prisma.settings.create>>
  }
})
