import type { MetadataRoute } from 'next'
import { getActiveBlogPosts, getActivePortfolio } from '@/lib/data'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, portfolio] = await Promise.all([getActiveBlogPosts(), getActivePortfolio()])

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/services`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/about`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/contact`,   lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.6 },
  ]

  const blogPages: MetadataRoute.Sitemap = posts.map(post => ({
    url:             `${BASE}/blog/${post.slug}`,
    lastModified:    post.updatedAt,
    changeFrequency: 'monthly' as const,
    priority:        0.7,
  }))

  const portfolioPages: MetadataRoute.Sitemap = portfolio.map(item => ({
    url:             `${BASE}/portfolio#${item.slug}`,
    lastModified:    item.updatedAt,
    changeFrequency: 'monthly' as const,
    priority:        0.6,
  }))

  return [...staticPages, ...blogPages, ...portfolioPages]
}
