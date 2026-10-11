import { prisma } from '@/lib/prisma'
import type { SearchHit, SearchProvider, SearchQuery } from './types'

const snippet = (s: string, n = 160) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)

/**
 * Always-available provider backed by MySQL `LIKE`. MySQL's default collation is
 * case-insensitive, so no `mode` option is used (Prisma only supports it on PostgreSQL/Mongo).
 */
export const dbSearchProvider: SearchProvider = {
  name: 'database',
  isAvailable: () => true,
  async search({ q, types, limit }: SearchQuery) {
    const want = (t: string) => !types || types.length === 0 || types.includes(t as never)
    const per = Math.max(1, Math.ceil(limit / 2))
    const [posts, services, items] = await Promise.all([
      want('post')
        ? prisma.blogPost.findMany({ where: { active: true, OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] }, select: { title: true, slug: true, excerpt: true }, orderBy: { publishedAt: 'desc' }, take: per })
        : [],
      want('service')
        ? prisma.service.findMany({ where: { active: true, OR: [{ title: { contains: q } }, { shortDesc: { contains: q } }] }, select: { title: true, slug: true, shortDesc: true }, take: per })
        : [],
      // The public /portfolio and /portfolio/[slug] pages render published *Project* rows
      // (not PortfolioItem), so search must return those or the links would 404.
      want('portfolio')
        ? prisma.project.findMany({ where: { published: true, OR: [{ name: { contains: q } }, { description: { contains: q } }] }, select: { name: true, slug: true, description: true }, take: per })
        : [],
    ])
    const hits: SearchHit[] = [
      ...services.map((s) => ({ type: 'service' as const, title: s.title, url: `/services`, snippet: snippet(s.shortDesc) })),
      ...posts.map((p) => ({ type: 'post' as const, title: p.title, url: `/blog/${p.slug}`, snippet: snippet(p.excerpt) })),
      ...items.map((i) => ({ type: 'portfolio' as const, title: i.name, url: `/portfolio/${i.slug}`, snippet: snippet(i.description) })),
    ].slice(0, limit)
    return { total: hits.length, hits }
  },
}
