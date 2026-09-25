import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    const [recommendations, total] = await Promise.all([
      prisma.productRecommendation.findMany({
        where: { active: true },
        orderBy: { score: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productRecommendation.count({ where: { active: true } }),
    ])

    // Calculate engagement rate
    const engagementRate = recommendations.length > 0
      ? (recommendations.filter((r) => r.viewed).length / recommendations.length) * 100
      : 0

    return NextResponse.json({
      data: recommendations,
      stats: {
        totalRecommendations: total,
        engagementRate: engagementRate.toFixed(2),
        conversionRate: (
          (recommendations.filter((r) => r.purchased).length / recommendations.length) * 100
        ).toFixed(2),
      },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Recommendations fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
