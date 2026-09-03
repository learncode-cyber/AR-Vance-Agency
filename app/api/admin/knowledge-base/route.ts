import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const createArticleSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(50),
  category: z.string().min(2),
  tags: z.string().optional().default(''),
  published: z.boolean().optional().default(false),
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const category = url.searchParams.get('category')
  const skip = (page - 1) * limit

  const where: any = {}
  if (category) {
    where.category = category
  }

  try {
    const [articles, total] = await Promise.all([
      prisma.knowledgeBase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.knowledgeBase.count({ where }),
    ])

    return NextResponse.json({
      data: articles,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Articles fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createArticleSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const slug = parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const article = await prisma.knowledgeBase.create({
      data: {
        ...parsed.data,
        slug,
      },
    })

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    console.error('Create article error:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
