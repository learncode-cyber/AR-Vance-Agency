import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const severity = url.searchParams.get('severity')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  const where: any = {}
  if (severity) {
    where.severity = severity
  }

  try {
    const [anomalies, total] = await Promise.all([
      prisma.anomalyAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.anomalyAlert.count({ where }),
    ])

    // Calculate stats
    const criticalCount = anomalies.filter((a) => a.severity === 'critical').length
    const unresolvedCount = anomalies.filter((a) => a.status === 'new').length

    return NextResponse.json({
      data: anomalies,
      stats: {
        total,
        critical: criticalCount,
        unresolved: unresolvedCount,
      },
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Anomalies fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 })
  }
}
