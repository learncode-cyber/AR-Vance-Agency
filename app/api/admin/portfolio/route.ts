import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// Real `PortfolioItem` columns: slug, title, emoji, image, category, tags(Json),
// result, shortDesc, challenge, solution, results(Json), client, order, active.
// (The old route filtered on a non-existent `published` column, included a
// non-existent `service` relation, and wrote an `images` column.)
const createPortfolioSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  description: z.string().min(1),
  category: z.string().min(1).max(80),
  clientName: z.string().max(200).optional(),
  result: z.string().max(300).optional(),
  challenge: z.string().optional(),
  solution: z.string().optional(),
  image: z.string().max(500).optional(),
  emoji: z.string().max(8).optional(),
  tags: z.array(z.string().max(60)).max(30).optional(),
  results: z.array(z.string().max(300)).max(20).optional(),
})

function toUi<T extends { client: string; shortDesc: string; active: boolean }>(p: T) {
  return { ...p, clientName: p.client, description: p.shortDesc, published: p.active, featured: false }
}

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const category = new URL(req.url).searchParams.get('category')
  const where: { category?: string } = {}
  if (category) where.category = category

  try {
    const items = await prisma.portfolioItem.findMany({ where, orderBy: { order: 'asc' } })
    return NextResponse.json({ data: items.map(toUi) })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  if (!(await hasPermission(session.userId, 'manage_content'))) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createPortfolioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }
  const d = parsed.data

  try {
    const item = await prisma.portfolioItem.create({
      data: {
        slug: d.slug,
        title: d.title,
        shortDesc: d.description,
        category: d.category,
        result: d.result ?? '',
        tags: d.tags ?? [],
        results: d.results ?? [],
        ...(d.clientName ? { client: d.clientName } : {}),
        ...(d.challenge ? { challenge: d.challenge } : {}),
        ...(d.solution ? { solution: d.solution } : {}),
        ...(d.image ? { image: d.image } : {}),
        ...(d.emoji ? { emoji: d.emoji } : {}),
      },
    })

    await logActivity(session.userId, 'portfolio_created', 'portfolio', item.id, item.title)
    return NextResponse.json({ data: toUi(item) }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'A portfolio item with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 })
  }
}
