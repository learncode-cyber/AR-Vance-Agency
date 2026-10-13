import { getSettings } from '@/lib/settings'

/**
 * Centralized structured-data (JSON-LD) builders — real data only, backed
 * by the live site settings (lib/settings.ts), not hardcoded strings.
 *
 * Before this file, only one page anywhere (blog/[slug]) had any JSON-LD,
 * and two other files (lib/metadata.ts, lib/branding/metadata.ts) defined
 * hardcoded/duplicate Organization-style schemas that were never actually
 * imported by any page. This is the one real, wired-up source now.
 *
 * Render the result with:
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
 */

export async function organizationSchema() {
  const s = await getSettings()
  const sameAs = [s.socialLinkedin, s.socialTwitter, s.socialFacebook, s.socialInstagram].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: s.siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://arvanceagency.com',
    description: s.siteDescription,
    foundingDate: s.founded || undefined,
    email: s.contactEmail || undefined,
    telephone: s.contactPhone || undefined,
    address: s.address ? { '@type': 'PostalAddress', streetAddress: s.address } : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    // Project invariant: AR Qudrix parent-brand attribution must appear
    // in the Organization schema as a parentOrganization entity.
    parentOrganization: s.parentBrandName
      ? {
          '@type': 'Organization',
          name: s.parentBrandName,
          url: s.parentBrandUrl || undefined,
        }
      : undefined,
  }
}

export async function websiteSchema() {
  const s = await getSettings()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: s.siteName,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://arvanceagency.com',
    description: s.siteDescription,
  }
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

interface ServiceLike {
  slug: string
  title: string
  shortDesc: string
}

export async function serviceListSchema(services: ServiceLike[]) {
  const s = await getSettings()
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://arvanceagency.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((svc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: svc.title,
        description: svc.shortDesc,
        url: `${base}/services#${svc.slug}`,
        provider: { '@type': 'Organization', name: s.siteName },
      },
    })),
  }
}

/** Serializes a schema object as a ready-to-render <script> props pair. */
export function jsonLdScriptProps(schema: unknown) {
  return { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: JSON.stringify(schema) } } as const
}
