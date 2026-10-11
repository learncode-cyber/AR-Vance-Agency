import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { hasPermission, logActivity } from '@/lib/rbac'

// Matches the real `BlogPost` model: `category` is a plain string column,
// `tags` is JSON, visibility is `active` (the old version used categoryId /
// published / authorId and an `include: { category }` relation that do not
// exist, so every call failed with a Prisma validation error).
const createPostSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens'),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().min(1).max(60),
  image: z.string().max(500).optional(),
  readTime: z.string().max(30).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDesc: z.string().max(300).optional(),
  tags: z.array(z.string().max(60)).max(30).optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const published = url.searchParams.get('published')
  const category = url.searchParams.get('category')
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1') || 1)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20') || 20))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (published === 'true') where.active = true
  if (category) where.category = category

  try {
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({
      data: posts,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const hasAccess = await hasPermission(session.userId, 'manage_content')
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? 'Invalid data' }, { status: 400 })
  }

  try {
    const post = await prisma.blogPost.create({
      data: {
        ...parsed.data,
        tags: parsed.data.tags ?? [],
        author: session.email || 'Admin',
      },
    })

    await logActivity(session.userId, 'blog_post_created', 'blog', post.id, post.title)

    return NextResponse.json({ data: post }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string })?.code === 'P2002') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}
