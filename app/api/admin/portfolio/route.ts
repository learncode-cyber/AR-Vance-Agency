import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

const createPortfolioSchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string(),
  category: z.string(),
  clientName: z.string().optional(),
  featured: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const featured = url.searchParams.get('featured')

  const where: any = { published: true }
  if (category) where.category = category
  if (featured === 'true') where.featured = true

  try {
    const items = await prisma.portfolioItem.findMany({
      where,
      orderBy: { order: 'asc' },
      include: { service: true },
    })

    return NextResponse.json({ data: items })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const hasAccess = await hasPermission(session.userId, 'manage_content')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createPortfolioSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const portfolio = await prisma.portfolioItem.create({
      data: {
        ...parsed.data,
        images: JSON.stringify([]),
      },
    })

    await logActivity(session.userId, 'portfolio_created', 'portfolio', portfolio.id, portfolio.title)

    return NextResponse.json({ data: portfolio }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 })
  }
}
