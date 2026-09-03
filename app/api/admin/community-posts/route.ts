import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { logActivity } from '@/lib/rbac'

const createPostSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const category = url.searchParams.get('category')
  const featured = url.searchParams.get('featured')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = { published: true }
  if (category) where.category = category
  if (featured === 'true') where.featured = true

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { author: true, comments: { take: 5 } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      data: posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createPostSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const slug = parsed.data.title.toLowerCase().replace(/\s+/g, '-')
    
    const post = await prisma.post.create({
      data: {
        ...parsed.data,
        slug,
        tags: JSON.stringify(parsed.data.tags || []),
        authorId: session.userId,
      },
      include: { author: true },
    })

    await logActivity(session.userId, 'post_created', 'community', post.id, post.title)

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
