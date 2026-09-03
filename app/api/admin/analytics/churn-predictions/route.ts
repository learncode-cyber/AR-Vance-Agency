import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const riskLevel = url.searchParams.get('riskLevel')
  const skip = (page - 1) * limit

  const where: any = {}
  if (riskLevel) {
    where.riskLevel = riskLevel
  }

  try {
    const [predictions, total] = await Promise.all([
      prisma.churnPrediction.findMany({
        where,
        orderBy: { riskScore: 'desc' },
        skip,
        take: limit,
      }),
      prisma.churnPrediction.count({ where }),
    ])

    // Calculate metrics
    const highRiskCount = predictions.filter((p) => p.riskLevel === 'critical' || p.riskLevel === 'high')
      .length
    const actionTakenCount = predictions.filter((p) => p.actionTaken).length

    return NextResponse.json({
      data: predictions,
      stats: {
        totalAtRisk: total,
        highRiskCount,
        actionTakenCount,
        churnedCount: predictions.filter((p) => p.churned).length,
      },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Churn predictions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 })
  }
}
