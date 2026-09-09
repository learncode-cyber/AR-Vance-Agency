import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const addReactionSchema = z.object({
  postId: z.string().optional(),
  commentId: z.string().optional(),
  type: z.enum(['like', 'love', 'haha', 'wow', 'sad', 'angry']),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const postId = url.searchParams.get('postId')
  const commentId = url.searchParams.get('commentId')

  const where: any = { userId: session.userId }
  if (postId) where.postId = postId
  if (commentId) where.commentId = commentId

  try {
    const reactions = await prisma.reaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: reactions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = addReactionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  try {
    // Check if reaction already exists
    const existing = await prisma.reaction.findFirst({
      where: {
        userId: session.userId,
        postId: parsed.data.postId,
        commentId: parsed.data.commentId,
        type: parsed.data.type,
      },
    })

    if (existing) {
      // Remove reaction if it already exists
      await prisma.reaction.delete({ where: { id: existing.id } })
      return NextResponse.json({ data: { removed: true } })
    }

    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        userId: session.userId,
        postId: parsed.data.postId,
        commentId: parsed.data.commentId,
        type: parsed.data.type,
      },
    })

    return NextResponse.json({ data: reaction }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
  }
}
