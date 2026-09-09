import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Get active team members, ordered
    const [members, total] = await Promise.all([
      prisma.teamMember.findMany({
        where: { active: true },
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          name: true,
          role: true,
          shortBio: true,
          avatar: true,
          emoji: true,
          specialization: true,
          linkedin: true,
          twitter: true,
          website: true,
          featured: true,
        },
      }),
      prisma.teamMember.count({ where: { active: true } }),
    ])

    return NextResponse.json({
      data: members,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}
