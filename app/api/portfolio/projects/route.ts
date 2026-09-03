import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '12')
  const category = url.searchParams.get('category')
  const skip = (page - 1) * limit

  const where: any = {
    published: true,
    featuredInPortfolio: true,
  }

  if (category) where.category = category

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          category: true,
          coverImage: true,
          roi: true,
          clientSatisfaction: true,
          completionRate: true,
          technologies: true,
          featuredInPortfolio: true,
          publishedAt: true,
        },
      }),
      prisma.project.count({ where }),
    ])

    return NextResponse.json({
      data: projects,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Portfolio projects error:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}
