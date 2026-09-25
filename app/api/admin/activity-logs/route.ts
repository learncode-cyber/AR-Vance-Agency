import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const actionType = url.searchParams.get('actionType')
  const skip = (page - 1) * limit

  const where: any = {}
  if (actionType) {
    where.actionType = actionType
  }

  try {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ])

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}
