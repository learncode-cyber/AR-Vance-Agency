import type { MetadataRoute } from 'next'
import { ADMIN_PATH } from '@/lib/admin-path'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: [`/${ADMIN_PATH}/`, '/api/'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host:    BASE,
  }
}
