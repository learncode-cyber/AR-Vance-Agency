import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const url = new URL(req.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const segment = url.searchParams.get('segment')
  const skip = (page - 1) * limit

  const where: any = {}
  if (segment) {
    where.segment = segment
  }

  try {
    const [behaviors, total] = await Promise.all([
      prisma.customerBehavior.findMany({
        where,
        orderBy: { churnRisk: 'desc' },
        skip,
        take: limit,
      }),
      prisma.customerBehavior.count({ where }),
    ])

    return NextResponse.json({
      data: behaviors,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Customer behavior fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch behaviors' }, { status: 500 })
  }
}
