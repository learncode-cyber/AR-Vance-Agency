import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

const followSchema = z.object({
  followingId: z.string(),
})

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const action = url.searchParams.get('action')  // followers or following

  try {
    if (action === 'followers') {
      const followers = await prisma.follow.findMany({
        where: { followingId: session.userId },
        include: { follower: true },
      })
      return NextResponse.json({ data: followers })
    } else {
      const following = await prisma.follow.findMany({
        where: { followerId: session.userId },
        include: { following: true },
      })
      return NextResponse.json({ data: following })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch follows' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const body = await req.json()
  const parsed = followSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
  }

  if (parsed.data.followingId === session.userId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
  }

  try {
    // Check if already following
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.userId,
          followingId: parsed.data.followingId,
        },
      },
    })

    if (existing) {
      // Unfollow
      await prisma.follow.delete({ where: { id: existing.id } })
      
      // Update counts
      await prisma.userProfile.update({
        where: { userId: session.userId },
        data: { followingCount: { decrement: 1 } },
      })

      await prisma.userProfile.update({
        where: { userId: parsed.data.followingId },
        data: { followersCount: { decrement: 1 } },
      })

      return NextResponse.json({ data: { unfollowed: true } })
    }

    // Follow
    const follow = await prisma.follow.create({
      data: {
        followerId: session.userId,
        followingId: parsed.data.followingId,
      },
    })

    // Update counts
    await prisma.userProfile.update({
      where: { userId: session.userId },
      data: { followingCount: { increment: 1 } },
    })

    await prisma.userProfile.update({
      where: { userId: parsed.data.followingId },
      data: { followersCount: { increment: 1 } },
    })

    return NextResponse.json({ data: follow }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 })
  }
}
