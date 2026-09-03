import { prisma } from './prisma'

export function generateId(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * MySQL has no native array column type, so list fields (features, tags,
 * results) are stored as JSON and come back from Prisma typed as
 * `JsonValue` (unknown shape). This normalizes them to string[] at the
 * data layer so every page/component downstream can keep using
 * `.map()` / `.includes()` etc. without caring about the DB detail.
 */
function toArr(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : []
}

export async function getActiveServices() {
  try {
    const rows = await prisma.service.findMany({ where: { active: true }, orderBy: { order: 'asc' } })
    return rows.map(r => ({ ...r, features: toArr(r.features) }))
  } catch { return [] }
}

export async function getServiceBySlug(slug: string) {
  try {
    const row = await prisma.service.findUnique({ where: { slug } })
    return row ? { ...row, features: toArr(row.features) } : null
  } catch { return null }
}

export async function getActivePortfolio() {
  try {
    const rows = await prisma.portfolioItem.findMany({ where: { active: true }, orderBy: { order: 'asc' } })
    return rows.map(r => ({ ...r, tags: toArr(r.tags), results: toArr(r.results) }))
  } catch { return [] }
}

export async function getPortfolioItemBySlug(slug: string) {
  try {
    const row = await prisma.portfolioItem.findUnique({ where: { slug } })
    return row ? { ...row, tags: toArr(row.tags), results: toArr(row.results) } : null
  } catch { return null }
}

export async function getActiveBlogPosts() {
  try {
    const rows = await prisma.blogPost.findMany({ where: { active: true }, orderBy: { publishedAt: 'desc' } })
    return rows.map(r => ({ ...r, tags: toArr(r.tags) }))
  } catch { return [] }
}

export async function getFeaturedBlogPosts() {
  try {
    const rows = await prisma.blogPost.findMany({ where: { active: true, featured: true }, orderBy: { publishedAt: 'desc' } })
    return rows.map(r => ({ ...r, tags: toArr(r.tags) }))
  } catch { return [] }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const row = await prisma.blogPost.findUnique({ where: { slug } })
    return row ? { ...row, tags: toArr(row.tags) } : null
  } catch { return null }
}

export async function getActiveTeam() {
  try {
    return await prisma.teamMember.findMany({ where: { active: true }, orderBy: { order: 'asc' } })
  } catch { return [] }
}

export async function getActiveTestimonials() {
  try {
    return await prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: 'asc' } })
  } catch { return [] }
}

export async function getStats() {
  try {
    return await prisma.stat.findMany({ orderBy: { order: 'asc' } })
  } catch { return [] }
}
