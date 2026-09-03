import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { logActivity } from '@/lib/rbac'

const createCommentSchema = z.object({
  postId: z.string(),
  content: z.string().min(1),
  parentId: z.string().optional(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const postId = url.searchParams.get('postId')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = { approved: true }
  if (postId) where.postId = postId

  try {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: { author: true, replies: { include: { author: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ])

    return NextResponse.json({
      data: comments,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = createCommentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        ...parsed.data,
        authorId: session.userId,
      },
      include: { author: true, post: true },
    })

    // Update post comments count
    await prisma.post.update({
      where: { id: parsed.data.postId },
      data: { commentsCount: { increment: 1 } },
    })

    await logActivity(session.userId, 'comment_created', 'community', comment.id, 'New comment')

    return NextResponse.json({ data: comment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
