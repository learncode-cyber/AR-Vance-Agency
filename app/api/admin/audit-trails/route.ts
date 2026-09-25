import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  const entityType = url.searchParams.get('entityType')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '50')
  const skip = (page - 1) * limit

  const where: any = {}
  if (userId) where.userId = userId
  if (entityType) where.entityType = entityType

  try {
    const [trails, total] = await Promise.all([
      prisma.auditTrail.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditTrail.count({ where }),
    ])

    return NextResponse.json({
      data: trails,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit trails' }, { status: 500 })
  }
}
