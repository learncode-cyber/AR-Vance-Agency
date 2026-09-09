import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params

    const member = await prisma.teamMember.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        shortBio: true,
        avatar: true,
        coverImage: true,
        emoji: true,
        specialization: true,
        experience: true,
        skills: true,
        achievements: true,
        linkedin: true,
        twitter: true,
        website: true,
        phone: true,
        seoTitle: true,
        seoDesc: true,
        createdAt: true,
      },
    })

    if (!member || !member.active) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Team member fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 })
  }
}
